module.exports = async ({ items, totalItems, page, limit, response, inputAttributes, filePath, message }) => {
    try {
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const responseMessage = items.length > 0 ? message : 'No Items';

        const responseObject = {
            status:"success",
            message: responseMessage,
            meta: {
                total: totalItems ? totalItems : items.length,
                page: pageNum,
                limit: limitNum,
                ...(items.length > 0 && sails.config.custom.s3_bucket_options),
            },
            items: items,
        };

        response.ok(responseObject);

        process.nextTick(() => {
            UseDataService.processSwaggerGeneration({ relativePath: filePath, inputAttributes, responseObject });
        });


    } catch (error) {
        sails.log.error('Error in sendResponse:', error);
        response.serverError({ message: 'An error occurred while processing the request.' });
    }
};




//   process.nextTick(() => {
//     const relativePath = SwaggerGenService.getRelativePath(filePath);

//     const capitalizeFirstLetter = (str) => str.charAt(0).toUpperCase() + str.slice(1);

//     SwaggerGenService.generateJsonFile({
//       key: `/${relativePath}`,
//       Tags: capitalizeFirstLetter(relativePath.split('/')[0]),
//       Description: `Retrieve data of ${capitalizeFirstLetter(relativePath.split('/')[0])} - ${relativePath.split('/')[1]}`,
//       body: {},
//       params: { page: 1, limit: 10 },
//       required_data: inputAttributes,
//       response: responseObject,
//     });
//   });

// /**
//  * Sends a response with paginated data and metadata.
//  *
//  * @param {Object[]} items - The list of items to include in the response.
//  * @param {number} total - The total number of items available.
//  * @param {Object} response - The response object from the request.
//  * @param {number} page - The current page number.
//  * @param {number} limit - The number of items per page.
//  * @param {Object} tablesPhoto - Additional media information (optional).
//  * @param {Object} tablesVideo - Additional video information (optional).
//  */
// module.exports = (data) => {
//     const pageNum = parseInt(data.page, 10) || 1;
//     const limitNum = parseInt(data.limit, 10) || 10;

//     return response.ok({
//         message: data.message,
//         meta: {
//             count: data.items.length,
//             total: data.total,
//             page: pageNum,
//             limit: limitNum,
//             media: data.tablesPhoto,
//             video: data.tablesVideo,
//         },
//         items: items,
//     });
// };
