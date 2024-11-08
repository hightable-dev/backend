const moment = require('moment');
const common = require('../../services/common');
const DataService = require('../../services/DataService');

module.exports = function list(request, response) {
  const profileId = request.user.profile_members;
  const request_query = request.allParams();
  const { pending, expired, paymentSuccess} = paymentStatusCode;
  const { tablesVideo, tablesPhoto} = file_path;

  const { page, limit, search, date, to, category } = request_query;
  const filterData = ['expiry_date','order_id',"payment_details", "created_at", "updated_at"]; // Specify fields to filter
  const searchColumns = ['full_name', 'address', 'title']; // Specify columns to search in
  const dateFormatRegex = /^\d{2}-\d{2}-\d{4}$/;
  const filterCondition = [{ status: [paymentSuccess] }, { user_id: profileId }];
  const input_attributes = [
    { name: 'page', number: true, min: 1 },
    { name: 'limit', number: true, min: 1 }
  ];

  if (category) {
    filterCondition.push({ category: category });
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

      // Fetch all table bookings without any filtering
      TableBooking.find()
        .sort([{ created_at: 'DESC' }])
        .exec(async (err, bookings) => {
          if (err) {
            console.error("Error occurred while fetching tables:", err);
            return response.serverError({ error: "Error occurred while fetching tables" });
          }

          let filteredItems = bookings;
          // Apply filter conditions 
          filteredItems = common.applyFilterConditions(filteredItems, filterCondition);
          console.log('filteredItems',filteredItems)

          if (filteredItems.length === 0) {
            return response.ok({ message: 'There is no booking' ,items : []});
          }
          // Filter out specific data items
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
          // Enhance each item with table details
          for (const item of filteredItems) {
            try {
              // Find table details based on table_id
              const tableDetails = await Tables.findOne({ id: item.table_id });
              if (tableDetails) {
                // Restrict the table details to only include full_name and media
                tableDetails.event_date = DataService.formatDate.ddmmyyyy_hhmm(tableDetails.event_date);
                tableDetails.media =  tableDetails.media ? tablesPhoto + tableDetails.media : null;

                const category = await Interests.findOne({ id: parseInt(tableDetails.category) });

                if (category && category.name) {
                  tableDetails.category_name = category.name;
                } else {
                  tableDetails.category_name = "No category found";
                }
                item.table_details =  tableDetails ? tableDetails: "There is no table for the booking" ;
                const creator_details = await ProfileMembers.findOne({ id: parseInt(tableDetails.created_by) });
                if(creator_details.photo){
                  creator_details.photo = sails.config.custom.filePath.members +  creator_details.photo;
                }
                item.creator_details = creator_details;
              } else {
                item.table_details =  tableDetails ? tableDetails: "There is no table for the booking" ;
              }
            } catch (error) {
              console.error("Error finding table details:", error);
              // Handle the error if necessary
            }
          }


          // const userDataFilter = ['first_name', 'last_name','photo'];

          // // Your existing code
          // for (const item of filteredItems) {
          //   try {
          //     // Find table details based on table_id
          //     const userDetails = await ProfileMembers.findOne({ id: item.user_id });
          //     if (userDetails) {
          //       // Add creator details to the item
          //       item.creator_details = {
          //         full_name: userDetails.first_name + ' ' + userDetails.last_name,
          //         photo: sails.config.custom.filePath.members + userDetails.photo
          //       };

          //       // Filter data items using userDataFilter
          //       const filteredData = userDataFilter.reduce((acc, key) => {
          //         if (userDetails[key]) {
          //           acc[key] = userDetails[key];
          //         }
          //         return acc;
          //       }, {});

          //       item.creator_details = filteredData;
          //     } else {
          //     }
          //   } catch (error) {
          //     console.error("Error finding table details:", error);
          //     // Handle the error if necessary
          //   }
          // }


          for (const item of filteredItems) {
            try {
              // Find table details based on table_id
              const userDetails = await ProfileMembers.findOne({ id: item.user_id });
              if (userDetails) {

                userDetails.photo = userDetails.photo ? sails.config.custom.filePath.members +  userDetails.photo : null;

                item.user_details = userDetails;
              } else {

                return res.status(500).json({ error: `Table details not found for table ID ${item.user_id}` });
              }
            } catch (error) {
              console.error("Error finding table details:", error);
              // Handle the error if necessary
            }
          }

       
  
          
          // Paginate the filtered table bookings
          const paginateItems = common.paginateData(filteredItems, pageNumber, limitNumber);

          // Send response
          const _response_object = {
            message: 'Tables retrieved successfully.',
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