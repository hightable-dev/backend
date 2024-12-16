// capitalizeFirstLetter.js
function capitalizeFirstLetter(str) {
  return typeof str === 'string' && str.length > 0
    ? str.charAt(0).toUpperCase() + str.slice(1)
    : str;
}

// processSwaggerGeneration.js
async function processSwaggerGeneration(data) {
  const { relativePath, inputAttributes, responseObject } = data;

  try {
    if (relativePath) {
      await SwaggerGenService.generateJsonFile({
        key: `/${relativePath}`,
        Tags: capitalizeFirstLetter(relativePath.split('/')[0]),
        Description: `Retrieve data of ${capitalizeFirstLetter(relativePath.split('/')[0])} - ${relativePath.split('/')[1]}`,
        body: {},
        params: { page: 1, limit: 10 },
        required_data: { ...inputAttributes },
        response: { ...responseObject }
      });
    }

  } catch (error) {
    throw error;
  }
}


module.exports = { capitalizeFirstLetter, processSwaggerGeneration };


// // Example usage
// process.nextTick(() => {
//   const relativePath = SwaggerGenService.getRelativePath(__filename);
//   processSwaggerGeneration(relativePath, input_attributes, responseObject);
// });
