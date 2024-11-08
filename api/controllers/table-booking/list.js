const _ = require('lodash');
const DataService = require('../../services/DataService');

module.exports = async function list(request, response) {
  const userType = request.user.types;

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
  function buildCriteria(status, search) {
    let criteria = {};
    /** For Post method query params **/

    /* if (Array.isArray(status) && status.length > 0) {
        criteria.status = { in: status };
      } else {
        criteria.status = { '!=': [0] };  //Filter out status 0 if status array is empty or undefined
      } 
    */

    /** For Get method query params **/
    console.log('booking_status', booking_status)
    if (booking_status === 'pending') {
      criteria.status = { in: [5, 11] };
    } else if (booking_status === 'booked') {
      criteria.status = { in: [9] };
    } else {
      criteria.status = { '!=': [0] };
    }

    // if (status) {
    //   criteria.status = { in: [status] };
    // } else {

    //   criteria.status = { '!=': [0] }; // Filter out status 0 if status array is empty or undefined
    // }

    if (table_id) {
      criteria.table_id = table_id;
    }
    if (userType === 2) {
      switch (type) {
        case 'created_by':
          criteria.creator_id = ProfileMemberId(request);
          break;
        case 'booked_by':
          criteria.user_id = ProfileMemberId(request);
          break;
      }
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
        const criteria = buildCriteria(status, search);

        // Fetch all items matching criteria
        let itmes = await TableBooking.find({ where: criteria })
          .sort('created_at DESC')
          .populate('user_id')

        /* Process items to add distance and filter based on distance <= 50
           const filteredItems = [];
           await Promise.all(
             itmes.map(async (data) => {
               try {
            
                 filteredItems.push(data);    // For non-vendor users, add all items
               } catch (error) {
                 console.error('Error processing service request:', error);
               }
             })
           ); 
        */

        await Promise.all(
          items
            .map(async item => {
              // Perform transformations only on items that passed the filter
              if (item.event_date) {
                item.event_date = DataService.formatDate.ddmmyyyy_hhmm(item.event_date);
              }
              return item; // Return the transformed item
            })
        );

        for (const item of itmes) {
          if (item.user_id.photo) {
            item.user_id.photo = sails.config.custom.filePath.members + item.user_id.photo;
          }
        }
        const totalItems = itmes.length;
        // Pagination based on filtered items
        const paginatedItems = itmes.slice(skip, skip + limit);

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