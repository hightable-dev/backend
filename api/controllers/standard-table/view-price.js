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
  const { page, limit} = request_query;
  const input_attributes = [
    { name: 'page', number: true, min: 1 },
    { name: 'limit', number: true, min: 1 }
  ];

  validateModel.validate(null, input_attributes, { page, limit },  function (valid, errors) {
    if (valid) {
      const pageNumber = parseInt(page) || 1;
      const limitNumber = parseInt(limit) || 10;

      // Fetch all tables without any filtering
      StandardTable.find().limit(1)
        .sort([{ created_at: 'DESC' }])
        .exec((err, tables) => {
          if (err) {
            return response.serverError({ message: "Error occurred while fetching tables", error: err });
          }
  
          const paginateItems = common.paginateData(tables, pageNumber, limitNumber);
          // Send response
          const _response_object = {
            message: 'Standard table price retrieved successfully.',
            // meta: {
            //   page: pageNumber,
            //   limit: limitNumber,
            //   total: tables.length,
            //   // media: sails.config.custom.uploadFilePath.tables,
            // },

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
