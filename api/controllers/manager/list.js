
module.exports = function list(request, response) {
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
  let responseObject = {};

  const sendResponse = (items, total) => {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    responseObject = 
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
      const capitalizeFirstLetter = (str) => {
        if (typeof str !== 'string' || str.length === 0) return str;
        return str.charAt(0).toUpperCase() + str.slice(1);
      };
      
      const relativePath = SwaggerGenService.getRelativePath(__filename);
      
      // Check the value of input_attributes before passing it
      if (!Array.isArray(input_attributes)) {
        throw new Error('input_attributes should be an array');
      }
      
      SwaggerGenService.generateJsonFile({
        key: `/${relativePath}`,
        Tags: capitalizeFirstLetter(relativePath.split('/')[0]),
        Description: `Retrieve a ${relativePath.split('/')[0]} list.`,
        body: {},
        params: { page: 1, limit: 10 },
        required_data: input_attributes,  // This should be an array
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
