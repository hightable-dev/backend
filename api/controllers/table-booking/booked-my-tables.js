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
  const { pending, expired, paymentSuccess} = paymentStatusCode;

  const { page, limit, search, date, to, category,table_id } = request_query;
  const filterData = ['order_id','payment_id','expiry_date','category','amount','created_by',"payment_details", "created_at", "updated_at"]; // Specify fields to filter

  const searchColumns = ['full_name', 'address', 'title']; // Specify columns to search in
  const dateFormatRegex = /^\d{2}-\d{2}-\d{4}$/;
  // const loggedUserID = 413; // will be updated after login
  const filterCondition = [{status:[paymentSuccess]}];
  const input_attributes = [
    { name: 'page', number: true, min: 1 },
    { name: 'limit', number: true, min: 1 }
  ];

  if (category) {
    filterCondition.push({ category: category });
  }
  if (table_id) {
    filterCondition.push({ table_id: table_id });
  }
  // Validate the date format
  if (date && !dateFormatRegex.test(date)) {
    return response.badRequest({ error: "Invalid date format. Please provide the date in DD-MM-YYYY format." });
  }

  // Validate the 'to' parameter format
  if (to && !dateFormatRegex.test(to)) {
    return response.badRequest({ error: "Invalid 'to' date format. Please provide the date in DD-MM-YYYY format." });
  }

  validateModel.validate(null, input_attributes, { page, limit }, async function (valid, errors) {
    if (valid) {
      const pageNumber = parseInt(page) || 1;
      const limitNumber = parseInt(limit) || 10;

      // Fetch all tables without any filtering
      TableBooking.find()
        .sort([{ created_at: 'DESC' }])
        .exec(async (err, tables) => {
          if (err) {
            console.error("Error occurred while fetching tables:", err);
            return response.serverError({ error: "Error occurred while fetching tables" });
          }

          let filteredItems = tables;
          //1. Apply filter conditions 
          filteredItems = common.applyFilterConditions(filteredItems, filterCondition);

          if (filteredItems.length === 0) {
            // return response.notFound({ message: 'No data found' });
            return response.badRequest({ message: 'No data found for the Filter Condition Not match' });
          }
          //2. Filter out specific data items
          filteredItems = common.filterDataItems(filteredItems, filterData);

          // Perform search
          if (search) {
            filteredItems = common.multiColumnSearch(search.toLowerCase(), filteredItems, searchColumns);
          }


          // Filter by date range if both date and to parameters are provided
          if (date && to) {
            const startDate = moment(date, 'DD-MM-YYYY');
            const endDate = moment(to, 'DD-MM-YYYY').endOf('day');

            if (!startDate.isValid() || !endDate.isValid()) {
              return response.badRequest({ error: "Invalid date format. Please provide the date in DD-MM-YYYY format." });
            }

            filteredItems = filteredItems.filter(table => {
              const eventDate = moment(table.event_date, 'YYYY-MM-DD HH:mm'); // Assuming event_date is in this format
              return eventDate.isBetween(startDate, endDate, null, '[]');
            });
          } else if (date) { // If only date parameter is provided
            const parsedDate = moment(date, 'DD-MM-YYYY');

            // Validate the parsed date
            if (!parsedDate.isValid()) {
              return response.badRequest({ error: "Invalid date format. Please provide the date in DD-MM-YYYY format." });
            }

            // Filter data for the specific date
            filteredItems = filteredItems.filter(table => {
              const eventDate = moment(table.event_date, 'YYYY-MM-DD HH:mm'); // Assuming event_date is in this format
              return eventDate.isSame(parsedDate, 'day');
            });
          }

          if (filteredItems.length === 0) {
            return response.notFound({ message: 'No data found' });
          }

          /* iMAGES HANDLING START */ 
          filteredItems.forEach(item => {
            if (item) {
              // Add the prefix to the media property
              item.category = parseInt(item.category);
              item.created_by = parseInt(item.created_by);
          }
            // Check if the item has a media property
            if (item.media) {
              // Add the prefix to the media property
              item.media = sails.config.custom.filePath.tables + item.media;
            }
          });


          /* iMAGES HANDLING END */ 

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