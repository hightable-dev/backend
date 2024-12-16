module.exports = async function create(request, response, data) {
  const { modelName, inputAttributes, postData,payloadData, path } = data;

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
    if(path){
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
    }

    return details; // Return the created data
  };

  const createData = async (post_data) => {
    return new Promise((resolve, reject) => {
      modelName.create(post_data, async function (err, newData) {
        if (newData) {
          resolve(await sendResponse("Data created successfully.", newData));
        } else {
            throw err;

          // await errorBuilder.build(err, function (error_obj) {
          //   _response_object.errors = error_obj;
          //   _response_object.count = error_obj.length;

          //   // Ensure no duplicate responses
          //   if (!response.headersSent) {
          //     response.status(500).json(_response_object);
          //   }
          // });
        }
      });
    });
  };

  // Validate model and proceed with creation
  return new Promise((resolve, reject) => {
    validateModel.validate(
      modelName,
      payloadData,
      postData,
      async function (valid, errors) {
        if (valid) {
          try {
            const result = await createData(postData);
            return result; // Return created data
          } catch (err) {
            throw err ;
          }
        } else {
          _response_object.errors = errors;
          _response_object.count = errors.length;

          // Ensure no duplicate responses
          if (!response.headersSent) {
            response.status(400).json(_response_object);
          }
          reject(new Error("Validation failed."));
        }
      }
    );
  });
};
