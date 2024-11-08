// /**
//  * @author mohan <mohan@studioq.co.in>
//  */

// /* global _, ProfileManagers /sails */

// const moment = require('moment');
// const common = require('../../services/common');

// module.exports = function list(request, response) {
//   const request_query = request.allParams();
//   const { page, limit, search, date, to, category } = request_query;
//   const filterData = ['payment_details', 'facebook_data', 'created_at', 'updated_at']; // Specify fields to filter
//   const searchColumns = ['full_name', 'address', 'title']; // Specify columns to search in
//   const dateFormatRegex = /^\d{2}-\d{2}-\d{4}$/;
//   const filterCondition = [];
//   const input_attributes = [
//     { name: 'page', number: true, min: 1 },
//     { name: 'limit', number: true, min: 1 }
//   ];

//   if (category) {
//     filterCondition.push({ category: category });
//   }

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

//       ProfileMembers.find().exec(async (err, items) => {
//         if (err) {
//           console.error("Error occurred while fetching tables:", err);
//           return response.serverError({ error: "Error occurred while fetching tables" });
//         }

//         let filteredItems = items;
//         filteredItems = common.applyFilterConditionsAdmin(filteredItems, filterCondition);

//         if (filteredItems.length === 0) {
//           return response.badRequest({ message: 'No data found for the Filter Condition Not match' });
//         }
//         filteredItems = common.filterDataItems(filteredItems, filterData);

//         if (search) {
//           filteredItems = common.multiColumnSearch(search.toLowerCase(), filteredItems, searchColumns);
//         }

//         if (filteredItems.length === 0) {
//           return response.notFound({ message: 'No data found' });
//         }

//         // Map to store user IDs and their booking counts
//         const userBookingCounts = new Map();

//         for (const item of filteredItems) {
//           if(item) {
//             const totalTablesCount = await Tables.count({ created_by: item.id });
//             item.tablesHosted = totalTablesCount; 

//             const totalBookedCount = await TableBooking.count({ user_id: item.id });
//             // Increment booking count for the user ID
//             userBookingCounts.set(item.id, (userBookingCounts.get(item.id) || 0) + totalBookedCount); 


//           }

//           try {
//             if (item.photo) {
//               item.category = parseInt(item.category);
//               item.photo = sails.config.custom.filePath.members + item.photo;
//             }
            
//             if (item.phone) {
//               await phoneEncryptor.decrypt(item.phone, function (decrypted_text) {
//                 item.phone = decrypted_text;
//               });
//             }

//             if (item.interests) {
//               item.interests = await Promise.all(item.interests.map(async (interestId) => {
//                 const interest = await Interests.findOne({ id: interestId });
//                 return interest ? interest.name : null;
//               }));
//             }
//           } catch (error) {
//             console.error("Error finding interests:", error);
//           }
//         }

//         // Assign booking counts to items
//         for (const item of filteredItems) {
//           item.tablesBooked = userBookingCounts.get(item.id) || 0;
//         }

//         const paginateItems = common.paginateData(filteredItems, pageNumber, limitNumber);
//         const _response_object = {
//           message: 'Tables retrieved successfully.',
//           meta: {
//             page: pageNumber,
//             limit: limitNumber,
//             total: filteredItems.length,
//           },
//           items: paginateItems
//         };
//         return response.ok(_response_object);
//       });
//     } else {
//       const _response_object = {
//         errors: errors,
//         count: errors.length
//       };
//       return response.badRequest(_response_object);
//     }
//   });
// };
