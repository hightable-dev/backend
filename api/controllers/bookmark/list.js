/**
 * @author mohan <mohan@studioq.co.in>
 */

/* global _, ProfileManagers /sails */

const moment = require('moment');
const common = require('../../services/common');

module.exports = function list(request, response) {
  const { pending, approved, rejected, bookingClosed, bookmarkTable } = tableStatusCode;
  const { tablesVideo, tablesPhoto} = file_path;

  // const profileId = request.user.profile_members;
  
//   const logged_in_user = request;
  const request_query = request.allParams();
  const { page, limit } = request_query;
//   const filterData = ["payment_details", "created_at", "updated_at"]; // Specify fields to filter
//   const searchColumns = ['full_name', 'address', 'title']; // Specify columns to search in
//   const dateFormatRegex = /^\d{2}-\d{2}-\d{4}$/;
  // const filterCondition = [{user_id: profileId.toString()},{status:['13']}];

  const filterCondition = [{user_id: parseInt(ProfileMemberId(request))},{status:[bookmarkTable]}];
  const input_attributes = [
    { name: 'page', number: true, min: 1 },
    { name: 'limit', number: true, min: 1 }
  ];

  validateModel.validate(null, input_attributes, { page, limit }, async function (valid, errors) {
    if (valid) {
      const pageNumber = parseInt(page) || 1;
      const limitNumber = parseInt(limit) || 10;  

      // Fetch all tables without any filtering
      Bookmarks.find()
        .exec(async (err, tables) => {
          if (err) {
            console.error("Error occurred while fetching tables:", err);
            return response.serverError({ error: "Error occurred while fetching tables" });
          }

          let filteredItems = tables;
          // Apply filter conditions 
          filteredItems = common.applyFilterConditions(filteredItems, filterCondition);

          if (filteredItems.length === 0) {
            return response.badRequest({ message: 'No data found' });
          }
       
          if (filteredItems.length === 0) {
            return response.notFound({ message: 'No data found' });
          }

        for (const item of filteredItems) {
            try {
              // Find table details based on table_id
              const tableDetails = await Tables.findOne({ id: item.table_id });
              item.table_details = tableDetails ;
              if (tableDetails) {
                if(tableDetails.media){

                  tableDetails.media =  tableDetails.media ? tablesPhoto + tableDetails.media : null;
                  tableDetails.video = tableDetails.video ? tablesVideo + tableDetails.video : null;
                  // tablesVideo, tablesPhoto
                }

                const category = await Interests.findOne({ id: tableDetails.category }); // Dynamic ID passed as argument
                tableDetails.category = category.name;
                
                // Restrict the table details to only include full_name and media
                item.table_details = tableDetails ;


              } else {
                return response.status(500).json({ error: `Table details not found for table ID ${item.table_id}` });
              }
            } catch (error) {
              console.error("Error finding table details:", error);
              return response.status(500).json({ error: `"Error finding table details:" ${error}` });

              // Handle the error if necessary
            }
          }
          
          for (const item of filteredItems) {
            try {
              // Find table details based on table_id
              const creatorDetails = await ProfileMembers.findOne({ id: item.creator_profile_id });
              if (creatorDetails) {

                if(creatorDetails.photo){
                  creatorDetails.photo = sails.config.custom.filePath.members +  creatorDetails.photo;

                }
                item.creator_details = creatorDetails;
              } else {
                return res.status(500).json({ error: 'Could not capture payment' });
              }
            } catch (error) {
              return response.status(500).json({ error: `"Error finding table details:" ${error}` });
              // Handle the error if necessary
            }
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
