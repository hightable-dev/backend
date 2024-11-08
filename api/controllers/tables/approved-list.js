// /**
//  * @author mohan <mohan@studioq.co.in>
//  */

// /* global _, ProfileManagers /sails */

// const moment = require('moment');
// const common = require('../../services/common');

// module.exports = function mylist(request, response) {
//   const request_query = request.allParams();
//   const { page, limit, search, date, to, tableId } = request_query;

//   const input_attributes = [
//     { name: 'page', number: true, min: 1 },
//     { name: 'limit', number: true, min: 1 }
//   ];

//   const filterData = ["payment_details", "created_at", "updated_at"]; // Specify fields to filter
//   const loggedUserID = 413;
//   const filterCondition = [{ status: [2]}]; 

//   const dateFormatRegex = /^\d{2}-\d{2}-\d{4}$/;

//   // Validate the date format
//   if (date && !dateFormatRegex.test(date)) {
//     return response.badRequest({ error: "Invalid date format. Please provide the date in DD-MM-YYYY format." });
//   }

//   // Validate the 'to' parameter format
//   if (to && !dateFormatRegex.test(to)) {
//     return response.badRequest({ error: "Invalid 'to' date format. Please provide the date in DD-MM-YYYY format." });
//   }

//   validateModel.validate(null, input_attributes, { page, limit }, async function (valid, errors) {
//     if (valid) {
//       const pageNumber = parseInt(page) || 1;
//       const limitNumber = parseInt(limit) || 10;

//       // Construct query for fetching table bookings
//       const query = {};

//       // Add table_id filter if provided
//       if (tableId) {
//         query.table_id = tableId;
//       }

//       // Fetch table bookings based on the constructed query
//       Tables.find(query)
//         .sort([{ status: 'DESC' }])
//         .exec((err, bookings) => {
//           if (err) {
//             console.error("Error occurred while fetching table bookings:", err);
//             return response.serverError({ error: "Error occurred while fetching table bookings" });
//           }

//           let filteredItems = bookings;
//           const searchColumns = ['full_name', 'address', 'title']; // Specify columns to search in

//           // Perform search
//           if (search) {
//             filteredItems = common.multiColumnSearch(search.toLowerCase(), filteredItems, searchColumns);
//           }

//           // Filter by date range if both date and to parameters are provided
//           if (date && to) {
//             const startDate = moment(date, 'DD-MM-YYYY');
//             const endDate = moment(to, 'DD-MM-YYYY').endOf('day');

//             if (!startDate.isValid() || !endDate.isValid()) {
//               return response.badRequest({ error: "Invalid date format. Please provide the date in DD-MM-YYYY format." });
//             }

//             filteredItems = filteredItems.filter(booking => {
//               const eventDate = moment(booking.event_date, 'YYYY-MM-DD HH:mm'); // Assuming event_date is in this format
//               return eventDate.isBetween(startDate, endDate, null, '[]');
//             });
//           } else if (date) { // If only date parameter is provided
//             const parsedDate = moment(date, 'DD-MM-YYYY');

//             // Validate the parsed date
//             if (!parsedDate.isValid()) {
//               return response.badRequest({ error: "Invalid date format. Please provide the date in DD-MM-YYYY format." });
//             }

//             // Filter data for the specific date
//             filteredItems = filteredItems.filter(booking => {
//               const eventDate = moment(booking.event_date, 'YYYY-MM-DD HH:mm'); // Assuming event_date is in this format
//               return eventDate.isSame(parsedDate, 'day');
//             });
//           }

     
//           // Apply filter conditions 
//           filteredItems = common.applyFilterConditions(filteredItems, filterCondition);

//           if (filteredItems.length === 0) {
//             // return response.notFound({ message: 'No data found' });
//             return response.badRequest({ message: 'No data found for the Filter Condition Not match' });
//           }


//           // Filter out specific data items
//           filteredItems = common.filterDataItems(filteredItems, filterData);

//           // Paginate the filtered bookings
//           const paginateItems = common.paginateData(filteredItems, pageNumber, limitNumber);

//           // Send response
//           const _response_object = {
//             message: 'Table bookings retrieved successfully.',
//             meta: {
//               page: pageNumber,
//               limit: limitNumber,
//               total: filteredItems.length
//             },
//             items: paginateItems
//           };

//           return response.ok(_response_object);
//         });

//     } else {
//       const _response_object = {
//         errors: errors,
//         count: errors.length
//       };
//       return response.badRequest(_response_object);
//     }
//   });
// };
