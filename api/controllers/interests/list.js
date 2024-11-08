/**
 * @author mohan <mohan@studioq.co.in>
 */

/* global _, ProfileManagers /sails */

const moment = require('moment');
const generateJsonFile = require('../../services/SwaggerGenService');

module.exports = async function list(request, response) {
  try {
    var _response_object = {};

    const request_query = request.allParams();
    const filtered_query_data = _.pick(request_query, ['page', 'limit']);
    const filterData = ["payment_details", "created_at", "updated_at"]; // Specify fields to filter
    // for commit changes 
    var input_attributes = [
      { name: 'page', number: true, min: 1 },
      { name: 'limit', number: true, min: 1 }
    ];

    validateModel.validate(null, input_attributes, filtered_query_data, async function (valid, errors) {
      if (valid) {
        const page = parseInt(filtered_query_data.page) || 1;
        const limit = parseInt(filtered_query_data.limit) || 10;
        const skip = (page - 1) * limit;

        // Fetch interests with pagination
        const interests = await Interests.find()
        .sort('name ASC')
        .skip(skip)
        .limit(limit);


        let filteredItems = interests;
        filteredItems = common.filterDataItems(filteredItems, filterData);

        for (const item of filteredItems) {
          try {

            if (item.image) {
              item.image = sails.config.custom.filePath.interests + item.image;
            }
          } catch (error) {
            console.error("Error finding user or category details:", error);
          }
        }


        // Format interests data
        // const formattedInterests = interests.map(interest => ({ id: interest.id, name: interest.name }));

        // Send response
        _response_object.message = 'Interests retrieved successfully.';
        _response_object.meta = {
          page: page,
          limit: limit,
          total: interests.length
        };

        _response_object.items = interests;

         response.ok(_response_object);

         const capitalizeFirstLetter = (str) => {
          if (typeof str !== 'string' || str.length === 0) return str;
          return str.charAt(0).toUpperCase() + str.slice(1);
        };
        
        process.nextTick(() => {
          const relativePath = SwaggerGenService.getRelativePath(__filename);
        
          console.log('capitalizeFirstLetter( relativePath.split('/')[0])', )
          SwaggerGenService.generateJsonFile({
            key: `/${relativePath}`,
            Tags: capitalizeFirstLetter( relativePath.split('/')[0]),
            Description: "Retrieve a list of tables based on various filters.",
            body: {},
            params: { page: 1, limit: 10 },
            required_data: input_attributes,
            response: _response_object
          });
        });

        return ;
      } else {
        _response_object.errors = errors;
        _response_object.count = errors.length;
        return response.status(400).json(_response_object);
      }
    });
  } catch (error) {
    console.error("Error occurred while fetching interests:", error);
    return response.status(500).json({ error: "Error occurred while fetching interests" });
  }
}
