
module.exports = function list(request, response) {
  const request_query = request.allParams();
  const { type: tableType, status: tableStatus, category, address } = request_query;
  // const userType = UserType(request);
  let { page, limit, search } = request_query;
  // for recommit changes
  const filtered_query_data = _.pick(request_query, [
    'page', 'sort', 'limit', 'city', 'address', 'category', 'type', 'status', 'search'
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
        ...sails.config.custom.s3_bucket_options,
      },
      items: items,
    };

    response.ok(responseObject);
    process.nextTick(() => {
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
    });
  };

  function buildCriteria() {
    let criteria = {}
    // criteria = UseDataService.tableListingCriteria({ userType, tableType, category, address, tableStatus })
    criteria = UseDataService.tableListingCriteriaWithoutLocationPublic({ tableType, category, tableStatus })
    // Handle search functionality


    return criteria;
  }

  validateModel.validate(null, input_attributes, filtered_query_data, async function (valid, errors) {
    if (valid) {
      try {
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;

        let criteria = await buildCriteria(search);
        
        if (search) {
          const searchValue = search.trim();
          const lookupFields = ['full_name', 'address', 'title'];
          const searchVariations = [
            searchValue.toLowerCase(),
            _.capitalize(searchValue),
            searchValue.toUpperCase(),
          ];

          const searchCriteria = lookupFields.map((field) => ({
            or: searchVariations.map((variation) => ({ [field]: { contains: variation } })),
          }));

          criteria.or = criteria.or || [];
          criteria.or.push(...searchCriteria);
        }

        // Fetch items and total count in parallel
        let [items, totalItems] = await Promise.all([
          Tables.find({ where: criteria })
            .sort('event_date ASC')
            .skip(skip)
            .limit(limit)
            .populate('category')
            .populate('user_profile'),
          Tables.count({ where: criteria })
        ]);

        await Promise.all(items.map((item) => {
          item.media = item?.media ? item.media[0] : 'image-1_1.webp';
          item.video = item?.video ? item.media[0] : null;
          item.event_date = UseDataService.dateHelper(item.event_date, 'YYYY-MM-DD HH:mm', 'DD-MM-YYYY HH:mm');
        }));

        sendResponse(items, totalItems);
      } catch (error) {
        console.error('Error retrieving service requests:', error);
        return response.serverError('Server Error');
      }
    } else {
      return response.status(400).json({
        errors: errors,
        count: errors.length,
      });
    }
  });
};
