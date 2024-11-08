/**
 * @author mohan <mohan@studioq.co.in>
 */

/* global _, ProfileManagers /sails */

const moment = require('moment');
// const searchService = require('../../services/common');
// const paginationService = require('../../services/common');
const common = require('../../services/common');

module.exports = function list(request, response) {

  const request_query = request.allParams();
  const { page, limit, search, date, to, category,type } = request_query;
  const filterCondition = [];
  const input_attributes = [
    { name: 'page', number: true, min: 1 },
    { name: 'limit', number: true, min: 1 }
  ];



  validateModel.validate(null, input_attributes, { page, limit }, async function (valid, errors) {
    if (valid) {
      const pageNumber = parseInt(page) || 1;
      const limitNumber = parseInt(limit) || 10;

      // Fetch all tables without any filtering
      PayoutHost.find()
        .sort([{ created_at: 'DESC' }])
        .exec(async (err, tables) => {
          if (err) {
            console.error("Error occurred while fetching tables:", err);
            return response.serverError({ error: "Error occurred while fetching tables" });
          }

          let filteredItems = tables;
          //1. Apply filter conditions 

          if (filteredItems.length === 0) {
            // return response.notFound({ message: 'No data found' });
            return response.ok({ message: 'No data found for the Filter Condition Not match' });
          }
          // Paginate the filtered tables
          const paginateItems = common.paginateData(filteredItems, pageNumber, limitNumber);

          // Send response
          const _response_object = {
            message: 'Tables retrieved successfully.',
            meta: {
              page: pageNumber,
              limit: limitNumber,
              total: filteredItems.length,
              // media: sails.config.custom.uploadFilePath.tables,
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
