/**
 * @author mohan <mohan@studioq.co.in>
 */

/* global _, ProfileManagers /sails */
const _ = require('lodash');

module.exports = function list(request, response) {
  try {
    var _response_object = {};

    const request_query = request.allParams();
    const filtered_query_data = _.pick(request_query, ['page', 'limit']);
    const filterData = ["payment_details", "created_at", "updated_at"]; // Specify fields to filter
    // for commit changes 
    var input_attributes = [
      { name: 'page', number: true, min: 1 },
      // { name: 'limit', number: true, min: 1 }
    ];

    validateModel.validate(null, input_attributes, filtered_query_data, async function (valid, errors) {
      if (valid) {
        const page = parseInt(filtered_query_data.page) || 1;
        // Fetch interests with pagination
        const interests = await Interests.find()
          .sort('orderby ASC')

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

        // Send response
        _response_object.message = 'Interests retrieved successfully.';
        _response_object.meta = {
          page: page,
          // limit: limit,
          total: interests.length
        };

        _response_object.items = interests;
        response.ok(_response_object);

        //  process.nextTick(() => {
        //   const relativePath = SwaggerGenService.getRelativePath(__filename);
        //   const capitalizeFirstLetter = (str) => {
        //     if (typeof str !== 'string' || str.length === 0) return str;
        //     return str.charAt(0).toUpperCase() + str.slice(1);
        //   };
        //   SwaggerGenService.generateJsonFile({
        //     key: `/${relativePath}`,
        //     Tags: capitalizeFirstLetter(relativePath.split('/')[0]),
        //     Description: `Retrieve data of ${capitalizeFirstLetter(relativePath.split('/')[0])} - ${relativePath.split('/')[1]}` ,
        //     body: {},
        //     params: { page: 1, limit: 10 },
        //     required_data: input_attributes,
        //     response: _response_object
        //   });
        // });
        process.nextTick(() => {
          const relativePath = SwaggerGenService.getRelativePath(__filename);
          UseDataService.processSwaggerGeneration({ relativePath, inputAttributes :input_attributes, responseObject: _response_object });

        });

        return;
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
