const _ = require('lodash');

module.exports = function list(request, response) {
  // Recommit changes
  const userType = request.user.types;
  const { payPending, paymentSuccess, bookingConfirmationPendingByCreator, refundRequest, refundSuccess } = UseDataService;

  let _response_object = {};
  const request_query = request.allParams();
  const filtered_query_data = _.pick(request_query, ['page', 'sort', 'limit', 'search', 'status', 'type', 'table_id', 'booking_status']);
  let { page, limit, status, search, type, table_id, booking_status } = filtered_query_data;

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
  async function buildCriteria() {
    let criteria = {};

    // Filter based on booking status
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

    if (UserType(request) === roles.member) {
      criteria.creator_id = ProfileMemberId(request);
      criteria.status = { in: [paymentSuccess] };
    }

   
    if (search) {
      const searchValue = search.trim();
      const lookupFields = ['order_id', 'payment_id'];

      // Determine whether the field is likely to be a string or a numeric ID
      const searchVariations = lookupFields.map((field) => {
        if (['order_id', 'payment_id'].includes(field)) {
          // For IDs or numbers, don't apply case variations, just search with the value directly
          return { [field]: { contains: searchValue } };
        } else {
          // For text fields, use case variations
          return {
            or: [
              { [field]: { contains: searchValue.toLowerCase() } },
              { [field]: { contains: _.capitalize(searchValue) } },
              { [field]: { contains: searchValue.toUpperCase() } }
            ]
          };
        }
      });

      // Add to the criteria
      criteria.or = criteria.or || [];
      criteria.or.push(...searchVariations);
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
        const criteria = await buildCriteria();
        // Fetch all items matching criteria
        let items = await TableBooking.find({ where: criteria })
          .sort('created_at DESC')
          .populate('table_id')
          .populate('user_id')

        // Transform each item
        await Promise.all(
          items.map(async item => {
            // if (item.table_id) {
            //   // Fetch the category from the table_id if it's not already populated
            //   const tableDetails = await Tables.findOne({ id: item.table_id })
            //     .populate('category'); // Populate category here
            //   // Assign populated category back to item
            //   // item.table_id.category = tableDetails.category;
            // }

            if (UserType(request) === roles.admin) {
              //  item.user_details = _.pick(item.user_id, ['first_name', 'last_name']);
               item.user_details = item.user_id;
               item.table_details = item.table_id;

              delete item.table_id;
              delete item.user_id;
              if (item.user_details?.photo) {
                item.user_details.photo = sails.config.custom.s3_bucket_options.profile_photo + item.user_details.photo;
              }

              if (item.user_details?.phone) {
                  item.user_details.phone = UseDataService.phoneCrypto.decryptPhone(item.user_details?.phone);
               }
            }

            if (UserType(request) === roles.manager) {
              // Additional logic for managers if needed
            }

            if (UserType(request) === roles.member) {
              if (item.user_id?.photo) {
                item.user_id.photo = sails.config.custom.s3_bucket_options.profile_photo + item.user_id.photo;
              }

              if (item.user_id?.phone) {
                  item.user_id.phone = UseDataService.phoneCrypto.decryptPhone(item.user_id?.phone);
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
        return response.serverError({ message:'Error fetching booking list', error});
      }
    } else {
      _response_object = {
        errors: errors,
        count: errors.length,
      };
      return response.badRequest(_response_object);
    }
  });
};
