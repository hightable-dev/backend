module.exports = async function list(request, response) {
  const request_query = request.allParams();
  const { type : tableType, status : tableStaus } = request_query ;

  const { pending, cancelled } = sails.config.custom.tableStatusCode;
  const { inactive } = sails.config.custom.statusCode;
  const filtered_query_data = _.pick(request_query, [
    'page', 'sort', 'limit', 'search', 'date', 'to', 'category', 'created_by', 'type'
  ]);
  let { page, limit, search, date: from_date, to: to_date, category, created_by, type } = filtered_query_data;
  const input_attributes = [
    { name: 'page', number: true, min: 1 },
    { name: 'limit', number: true, min: 1 },
  ];

  const tablesPhoto = sails.config.custom.filePath.tablesMedia;
  const tablesVideo = sails.config.custom.filePath.tablesVideo;

  const sendResponse = (items, total) => {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    return response.ok({
      message: 'Request form list retrieved successfully.',
      meta: {
        count: items.length,
        total: total,
        page: pageNum,
        limit: limitNum,
        media: tablesPhoto,
        video: tablesVideo,
      },
      items: items,
    });
  };


  function buildCriteria(search, category, from_date, to_date) {
    let criteria = {};
    const currentDate = new Date();
    const formattedDate = dateService.ddmmyyyy_hhmm(currentDate);
    criteria.event_date = { '>=': formattedDate };
    if (tableType) criteria.type = tableType;
    if (tableStaus) criteria.status = tableStaus;


    /***
     * Ex Current date is 16 Aug 2024 12:50 Pm
     * Event Dates Followed by
     * 16-08-2024 05:03 Not listed
     * 16-08-2024 12:49 Not listed
     * 16-08-2024 14:03 listed
     * 31-08-2024 14:03 listed
     */
    if (category) criteria.category = category;

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
        const criteria = buildCriteria(search, category, from_date, to_date);

        // Fetch items and total count in parallel
        const [items, totalItems] = await Promise.all([
          Tables.find({ where: criteria })
            .sort('event_date ASC')
            .skip(skip)
            .limit(limit)
            .populate('category')
            .populate('user_profile'),
          Tables.count({ where: criteria })
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
