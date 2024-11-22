const moment = require('moment');

module.exports = function list(request, response) {
  const request_query = request.allParams();
  let _response_object;
  const filterData = ["created_at", "updated_at"]; // Specify fields to filter

  const { page, limit } = request_query;
  const input_attributes = [
    { name: 'page', number: true, min: 1 },
    { name: 'limit', number: true, min: 1 }
  ];
  const filterCondition = [];

  validateModel.validate(null, input_attributes, { page, limit }, function (valid, errors) {
    if (valid) {
      const pageNumber = parseInt(page) || 1;
      const limitNumber = parseInt(limit) || 10;
      Tags.find()
        .exec((err, items) => {
          if (err) {
            console.error("Error occurred while fetching items:", err);
            return response.serverError({ error: "Error occurred while fetching items" });
          }

          let filteredItems = items;
          // Apply filter conditions 
          filteredItems = common.applyFilterConditions(filteredItems, filterCondition);
          filteredItems = common.filterDataItems(filteredItems, filterData);

          const paginateItems = common.paginateData(filteredItems, pageNumber, limitNumber);

          if (filteredItems.length === 0) {
            _response_object = {
              Error: 'No data found',
            }
            return response.status(404).json(_response_object);
          }


          // Send response
          _response_object = {
            message: 'Tags retrieved successfully.',
            meta: {
              page: pageNumber,
              limit: limitNumber,
              total: filteredItems.length,
            },
            items: paginateItems
          };
    
          return response.ok(_response_object);
        });
    } else {
      const _response_object = {
        errors: errors,
        count: errors.length
      };
      return response.badRequest(_response_object);
    }
  });
};
