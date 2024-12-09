
module.exports = function list(request, response) {
  const request_query = request.query;
  let { page, limit } = request_query;

  const filtered_query_data = _.pick(request_query, [
    'page','limit'
  ]);

  const input_attributes = [
    { name: 'page', number: true, min: 1 },
    { name: 'limit', number: true, min: 1 },
  ];


  let responseObject = {};
  const sendResponse = (items, totalItems) => {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    responseObject = {
      message: 'Request for list retrieved successfully.',
      meta: {
        total: totalItems,
        page: pageNum,
        limit: limitNum,
        // ...sails.config.custom.s3_bucket_options,
      },
      items: items,
    };

    response.ok(responseObject);
/*     process.nextTick(() => {
      const relativePath = SwaggerGenService.getRelativePath(__filename);
      // const capitalizeFirstLetter = (str) => {
      //   if (typeof str !== 'string' || str.length === 0) return str;
      //   return str.charAt(0).toUpperCase() + str.slice(1);
      // };
      const capitalizeFirstLetter = (str) => str.charAt(0).toUpperCase() + str.slice(1);
      SwaggerGenService.generateJsonFile({
        key: `/${relativePath}`,
        Tags: capitalizeFirstLetter(relativePath.split('/')[0]),
        Description: `Retrieve data of ${capitalizeFirstLetter(relativePath.split('/')[0])} - ${relativePath.split('/')[1]}`,
        body: {},
        params: { page: 1, limit: 10 },
        required_data: input_attributes,
        response: responseObject
      });
    }); */
  };

  async function buildCriteria() {
    let criteria = {}
    // criteria = UseDataService.tableListingCriteria({ userType, tableType, category, address, tableStatus })
    
    return criteria;
  }

  validateModel.validate(null, input_attributes, filtered_query_data, async function (valid, errors) {
    if (valid) {
      try {
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;

        let criteria = await buildCriteria();

        // Fetch items and total count in parallel
        let [items, totalItems] = await Promise.all([
          ErrorDetail.find({ where: criteria })
            .sort('created_at ASC')
            .skip(skip)
            .limit(limit),
          ErrorDetail.count({ where: criteria })
        ]);

        sendResponse(items, totalItems);
      } catch (error) {
        return response.serverError('Server Error');
      }
    } else {
      return response.badRequest({
        errors: errors,
        count: errors.length,
      });
    }
  });
};
