/**
 * Common service for creating entries in Tables
 * @param {Object} request
 * @param {Object} response
 * @param {Object} data
 */

/* global _, Tables, moment, errorBuilder, validateModel */

module.exports = async function create(request, response, data) {
  const { modelName, inputAttributes, filteredPostData, path } = data;

  let _response_object = {};

  // Send Response function
  const sendResponse = async (message, details) => {
    // Ensure we only send the response once
    if (response.headersSent) {
      return; // Exit if headers are already sent
    }

    _response_object.message = message;
    _response_object.details = details;

    response.ok(_response_object);

    // Update Table count after table creation
    await UseDataService.countTablesHosted(ProfileMemberId(request));

    // Generate Swagger documentation after response
    process.nextTick(() => {
      const relativePath = path;
      const capitalizeFirstLetter = (str) => str && str.charAt(0).toUpperCase() + str.slice(1);
      SwaggerGenService.generateJsonFile({
        key: `/${relativePath}`,
        Tags: capitalizeFirstLetter(relativePath.split("/")[0]),
        Description: `Create a table ${capitalizeFirstLetter(relativePath.split("/")[0])} - ${relativePath.split("/")[1]}`,
        body: {},
        required_data: inputAttributes,
        response: _response_object,
      });
    });

    return;
  };

  const createData = async (post_data) => {
    await modelName.create(post_data, async function (err, newData) {
      if (newData) {
        sendResponse("Data created successfully.", newData);
      } else {
        await errorBuilder.build(err, function (error_obj) {
          _response_object.errors = error_obj;
          _response_object.count = error_obj.length;

          // Ensure no duplicate responses
          if (!response.headersSent) {
            return response.serverError(_response_object);
          }
        });
      }
    });
  };

  // Validate model and proceed with creation
  validateModel.validate(
    Tables,
    inputAttributes,
    filteredPostData,
    async function (valid, errors) {
      if (valid) {
        createData(filteredPostData);
      } else {
        _response_object.errors = errors;
        _response_object.count = errors.length;

        // Ensure no duplicate responses
        if (!response.headersSent) {
          return response.badRequest(_response_object);
        }
      }
    }
  );
};
