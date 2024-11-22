const _ = require('lodash');

module.exports = function list(request, response) {
  const userType = request.user.types;
  const { payPending, paymentSuccess, bookingConfirmationPendingByCreator, refundRequest, refundSuccess } = UseDataService;

  let _response_object = {};
  const request_query = request.allParams();
  const filtered_query_data = _.pick(request_query, ['page', 'sort', 'limit', 'search', 'status', 'type', 'table_id', 'booking_status']);
  let { page, limit, status, search, type, table_id, booking_status } = filtered_query_data;
  console.log({ request_query })
  const input_attributes = [
    { name: 'page', number: true, min: 1 },
    { name: 'limit', number: true, min: 1 },
  ];


  // Function to send response
  const sendResponse = (items, total) => {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    _response_object = {
      message: 'Request form list retrieved successfully.',
      meta: {
        count: items.length,
        total: total,
        page: pageNum,
        limit: limitNum,
      },
      items: _.cloneDeep(items),
    };

    return response.ok(_response_object);
  };

  // Function to build criteria for search
  function buildCriteria(search) {
    let criteria = {
      status: { in: [paymentSuccess] },
    };

    /** For Post method query params **/

    /* if (Array.isArray(status) && status.length > 0) {
        criteria.status = { in: status };
      } else {
        criteria.status = { '!=': [0] };  //Filter out status 0 if status array is empty or undefined
      } 
    */

    /** For Get method query params **/
    if (UserType(request) === roles.admin) {
      if (booking_status === 'pending') {
        criteria.status = { in: [payPending, bookingConfirmationPendingByCreator] };
      } else if (booking_status === 'all') {
        delete criteria.status; // Ensure sta
      } else if (booking_status === 'booked') {
        criteria.status = { in: [paymentSuccess] };
      } else if (booking_status === 'refund-request') {
        criteria.status = { in: [refundRequest] };
      } else if (booking_status === 'refund-success') {
        criteria.status = { in: [refundSuccess] };
      }
    }

    if (table_id) {
      criteria.table_id = table_id;
    }
    // console.log({userType})
    /*    if (userType === 2) {
         console.log({ type })
         switch (type) {
           case 'created_by': */

    /*        break;
         case 'booked_by':
           criteria.user_id = ProfileMemberId(request);
           break;
       }
     } */

    if (UserType(request) === roles.member) {
      criteria.creator_id = ProfileMemberId(request);
    }

    if (search) {
      const searchValue = search.trim();
      const lookupFields = ['order_id'];
      const searchVariations = [
        searchValue.toLowerCase(),
        _.capitalize(searchValue),
        searchValue.toUpperCase(),
      ];

      const searchCriteria = lookupFields.map((field) => ({
        or: searchVariations.map((variation) => ({ [field]: { contains: variation } })),
      }));

      criteria.or = criteria.or || [];
      criteria.or.push(...searchCriteria);
    }
    return criteria;
  }


  // Validate and process request
  validateModel.validate(null, input_attributes, filtered_query_data, async function (valid, errors) {
    if (valid) {
      try {
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 5;
        const skip = (page - 1) * limit;
        const criteria = await buildCriteria(status, search);
        console.log({ criteria })
        // Fetch all items matching criteria
        let items = await TableBooking.find({ where: criteria })
          .sort('created_at DESC')
          .populate('user_id')
          .populate('table_id')
        await Promise.all(
          items
            .map(async item => {
              if (item.table_id) {
                // Fetch the category from the table_id if it's not already populated
                const tableDetails = await Tables.findOne({ id: item.table_id.id })
                  .populate('category'); // Populate category here

                // Assign populated category back to item
                item.table_id.category = tableDetails.category;
              }

              if (UserType(request) === roles.admin) {
                item.table_details = item.table_id
                item.user_details = item.user_id
                delete item.table_id
                delete item.user_id
                if (item.user_details?.photo) {
                  item.user_details.photo = sails.config.custom.s3_bucket_options.profile_photo + item.user_details.photo;
                }

                if (item.user_details?.phone) {
                  await phoneEncryptor.decrypt(item.user_details?.phone, function (decrypted_text) {
                    item.user_details.phone = decrypted_text;
                  });
                }
              }

              if (UserType(request) === roles.manager) {
              }

              if (UserType(request) === roles.member) {
                if (item.user_id?.photo) {
                  item.user_id.photo = sails.config.custom.s3_bucket_options.profile_photo + item.user_id.photo;
                }

                if (item.user_id?.phone) {
                  await phoneEncryptor.decrypt(item.user_id?.phone, function (decrypted_text) {
                    item.user_id.phone = decrypted_text;
                  });
                }
              }
              return item; // Return the transformed item
            })
        );

        const totalItems = items.length;
        // Pagination based on filtered items
        const paginatedItems = items.slice(skip, skip + limit);
        sendResponse(paginatedItems, totalItems);
      } catch (error) {
        console.error('Error retrieving service requests:', error);
        return response.serverError('Server Error');
      }
    } else {
      _response_object = {
        errors: errors,
        count: errors.length,
      };
      return response.status(400).json(_response_object);
    }
  });
};