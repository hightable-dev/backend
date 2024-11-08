
module.exports = async function list(request, response) {
  const { pending, cancelled, eventExpired } = sails.config.custom.tableStatusCode;
  const { inactive } = sails.config.custom.statusCode;
  const currentDate = new Date();
  const formattedDate = dateService.ddmmyyyy_hhmm(currentDate);
  const request_query = request.allParams();
  const filtered_query_data = _.pick(request_query, [
    'page', 'limit'
  ]);
  let { page, limit } = filtered_query_data;
  const input_attributes = [
    { name: 'page', number: true, min: 1 },
    { name: 'limit', number: true, min: 1 },
  ];

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
        image: sails.config.custom.filePath.interests,
      },
      items: items,
    });
  };

  function buildCriteria() {
    return {
      status: { '!=': [inactive, pending, cancelled, eventExpired] },
    };
  }

  validateModel.validate(null, input_attributes, filtered_query_data, async function (valid, errors) {
    if (valid) {
      try {
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;
        const criteria = buildCriteria();

        // Fetch items and total count in parallel
        let [items, totalItems] = await Promise.all([
          Interests.find({ where: criteria })
            .sort('created_at DESC')
            .skip(skip)
            .limit(limit),
          Interests.count({ where: criteria })
        ]);

        // Filter items based on the presence of matching records in the Tables collection
        items = await Promise.all(
          items.map(async (item) => {
            const tableCount = await Tables.count({
              where: {
                category: item.id, status: { '!=': [inactive, pending, cancelled, eventExpired] },
                event_date: { '>=': formattedDate }
              },
            });
            if (tableCount > 0) {
              item.image = sails.config.custom.filePath.interests + item.image;
              return item;
            }
            return null; // Mark item for removal
          })
        );


        // Remove null items
        items = items.filter(item => item !== null);

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
