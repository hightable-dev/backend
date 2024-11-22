
/**
 * @author mohan <mohan@studioq.co.in>
 */

/* global _, ProfileManagers /sails */
// For commit only
module.exports = async function listAdmin(request, response) {
  const { tablesPhoto } = file_path;
  let _response_object;

  // const requestBody = request.body || {}; // Initialize requestBody to an empty object if request.body is undefined
  // const { page, limit, search } = requestBody; // Destructure properties from requestBody

  const request_query = request.allParams();

  const { page, limit, search, table_id, status } = request_query;
  const { pending, expired } = UseDataService;

  const filterData = ["payment_details", "created_at", "updated_at"]; // Specify fields to filter
  const searchColumns = ['order_id', 'payment_id']; // Specify columns to search in
  // const dateFormatRegex = /^\d{2}-\d{2}-\d{4}$/;
  const filterCondition = [];
  const input_attributes = [
    { name: 'page', number: true, min: 1 },
    { name: 'limit', number: true, min: 1 }
  ];


  const expiredBookings = await TableBooking.find({
    where: { table_id: table_id, status: pending, expiry_date: { '<': new Date() } }
  });
  // Update status of expired bookings to 6
  for (const booking of expiredBookings) {
    await TableBooking.updateOne({ id: booking.id }).set({ status: expired });
  }

  if (table_id) {
    filterCondition.push({ table_id: parseInt(table_id) });
  }
  if (status) {
    filterCondition.push({ status: [parseInt(status)] });
  }

  validateModel.validate(null, input_attributes, { page, limit }, function (valid, errors) {
    if (valid) {
      const pageNumber = parseInt(page) || 1;
      const limitNumber = parseInt(limit) || 10;
      const { pending, expired, paymentSuccess } = paymentStatusCode;

      // Fetch all tables without any filtering
      TableBooking.find()
        //   .sort([{ type: 'DESC' }, { created_at: 'DESC' }])
        .exec(async (err, items) => {
          if (err) {
            console.error("Error occurred while fetching tables:", err);
            return response.serverError({ error: "Error occurred while fetching tables" });
          }

          let filteredItems = items;
          // Apply filter conditions 
          filteredItems = common.applyFilterConditions(filteredItems, filterCondition);

          // Filter out specific data items
          filteredItems = common.filterDataItems(filteredItems, filterData);

          // Perform search
          if (search) {
            filteredItems = common.multiColumnSearch(search.toLowerCase(), filteredItems, searchColumns);
          }


          // Enhance each item with table details
          for (const item of filteredItems) {
            try {
              // Find table details based on table_id
              const tableDetails = await Tables.findOne({ id: item.table_id });

              if (tableDetails) {

                const categoryData = await Interests.findOne({ id: parseInt(tableDetails.category) });
                tableDetails.category_name = categoryData.name;

                // tableDetails.media = sails.config.custom.filePath.tables + tableDetails.media;
                tableDetails.media = tablesPhoto + tableDetails.media;
                item.table_details = tableDetails;

                // const adminDetails = await ProfileAdmin.findOne({ id: tableDetails.admin_id });
                const userDetails = await ProfileMembers.findOne({ id: tableDetails.created_by });
                if (userDetails) {

                  // userDetails.photo = sails.config.custom.s3_bucket_options.profile_photo +  userDetails.photo;

                  item.user_details = userDetails;
                } else {
                  item.user_details = null;
                  return response.status(500).json({ error: `User details not found for the ID ${item.user_id}` });
                }

                const creator_details = await ProfileMembers.findOne({ id: parseInt(tableDetails.created_by) });
                if (creator_details.photo) {
                  creator_details.photo = sails.config.custom.s3_bucket_options.profile_photo + creator_details.photo;
                }
                item.creator_details = creator_details;

              } else {
                item.table_details = []
              }
            } catch (error) {
              console.error("Error finding table details:", error);
              // Handle the error if necessary
            }
          }

          for (const item of filteredItems) {
            try {
              // Find table details based on table_id
              const userDetails = await ProfileMembers.findOne({ id: item.user_id });
              if (userDetails) {

                userDetails.photo = sails.config.custom.s3_bucket_options.profile_photo + userDetails.photo;

                item.user_details = userDetails;
              } else {

                return response.status(500).json({ error: `User details not found for table ID ${item.user_id}` });
              }


            } catch (error) {
              console.error("Error finding table details:", error);
              // Handle the error if necessary
            }
          }




          // Fetch user details and category for each table
          for (const item of filteredItems) {

            const totalBookedCount = await TableBooking.count({ table_id: item.id });
            // Increment booking count for the user ID

            switch (item.status) {
              case pending:
                item.payment_status = "Payment pending";
                break;
              case expired:
                item.payment_status = "expired";
                break;
              case paymentSuccess:
                item.payment_status = "Payment success";
                break;
              // No default case specified
            }

            try {
              const user = await ProfileMembers.findOne({ id: parseInt(item.user_id) });
              const table = await Tables.findOne({ id: parseInt(item.table_id) });

              if (user) {
                if (user.phone) {
                  await phoneEncryptor.decrypt(user.phone, function (decrypted_text) {
                    user.phone = decrypted_text;
                  });
                }

                item.user_details = {
                  full_name: user.first_name + ' ' + user.last_name, // Ensure there's a space between first and last names
                  phone: user.phone,
                  // photo: sails.config.custom.s3_bucket_options.profile_photo + user.photo,
                };
              } else {
                console.error(`User ${item.user_id} not found.`);
              }

            } catch (error) {
              console.error("Error finding user or category details:", error);
            }
          }

          // Paginate the filtered tables
          const paginateItems = common.paginateData(filteredItems, pageNumber, limitNumber);

          if (filteredItems.length === 0) {
            _response_object = {
              Error: 'There is no booking for the table',
              items: [],
            }
            return response.status(500).json(_response_object);
          }


          // Send response
          _response_object = {
            message: 'Tables Booking retrieved successfully.',
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
