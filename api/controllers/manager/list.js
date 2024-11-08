
module.exports = async function list(request, response) {
  const request_query = request.allParams();
  const {status } = request_query;

  const filtered_query_data = _.pick(request_query, [
    'page', 'sort', 'limit', 'search', 'date', 'to', 'category', 'created_by', 'type'
  ]);
  let { page, limit, search} = filtered_query_data;
  const input_attributes = [
    { name: 'page', number: true, min: 1 },
    { name: 'limit', number: true, min: 1 },
  ];


  const sendResponse = (items, total) => {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    const responseObject = 
    {
      message: 'Request form list retrieved successfully.',
      meta: {
        count: items.length,
        total: total,
        page: pageNum,
        limit: limitNum,
      },
      items: items,
    }

     response.ok(responseObject);

    process.nextTick(() => {
      SwaggerGenService.generateJsonFile({
        key: `/${SwaggerGenService.getRelativePath(__filename)}`,
        Tags: "Interests",
        Description: "Retrieve a list of tables based on various filters.",
        body: {},
        params: { page: 1, limit: 10 },
        required_data: {
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 10 },
          search: { type: "string", example: "searchTerm" },
          from_date: { type: "string", format: "date-time", example: "2024-01-01T00:00:00Z" },
          to_date: { type: "string", format: "date-time", example: "2024-01-31T23:59:59Z" },
          category: { type: "integer", example: 1 },
          created_by: { type: "integer", example: 123 },
          type: { type: "integer", example: 2 }
        },
        response: responseObject
      });
    });
    return ;

  };


  function buildCriteria(search, status) {
    let criteria = {
    };

    if(status){
      criteria.status = status;
    }

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

    return criteria;
  }

  validateModel.validate(null, input_attributes, filtered_query_data, async function (valid, errors) {
    if (valid) {
      try {
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;
        const criteria = buildCriteria(search, status);

        // Fetch items and total count in parallel
        const [items, totalItems] = await Promise.all([
          ProfileManagers.find({ where: criteria })
            .skip(skip)
            .limit(limit),
          ProfileManagers.count({ where: criteria })
        ]);

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
