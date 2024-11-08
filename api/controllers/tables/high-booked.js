const DataService = require("../../services/DataService");

module.exports = async function list(request, response) {
  const request_query = request.allParams();
  const filtered_query_data = _.pick(request_query, [
    'page', 'sort', 'limit', 'search', 'date', 'to', 'category', 'created_by', 'type'
  ]);
  let { page, limit } = filtered_query_data;
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

  function buildCriteria() {
    /***
     * e_dt 30-08-2024 > today 31-08-2024 will not show
     * e_dt 31-08-2024 > today 30-08-2024 will show
     * e_dt 30-08-2024 06:00 > today 31-08-2024 11:59 will show
     */

    let criteria = {
      status: { '!=':DataService.listingTableStatusNotEqual},
      event_date: { '>=': DataService.formatDate.ddmmyyyy_hhmm() },
    };

    return criteria;
  }

  validateModel.validate(null, input_attributes, filtered_query_data, async function (valid, errors) {
    if (valid) {
      try {
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 7;
        const skip = (page - 1) * limit;
        const criteria = buildCriteria();

        // Fetch items and total count in parallel
        const [items, totalItems] = await Promise.all([
          Tables.find({ where: criteria })
            .sort('booked DESC')
            .skip(skip)
            .limit(limit)
            .populate('category')
            .populate('user_profile'),
          Tables.count({ where: criteria })
        ]);

        // Rename `created_by` to `user_profile` and process items concurrently
        await Promise.all(
          items.map(item => {
            item.media = item.media ? tablesPhoto + item.media : tablesPhoto + 'tables-media-1.png';
            item.event_date = DataService.formatDate.ddmmyyyy_hhmm(item.event_date);
            item.video = item.video ? tablesVideo + item.video : null;
            if(item.user_profile?.photo) {
              item.user_profile.photo = sails.config.custom.filePath.members + item.user_profile?.photo ;
            }
          })
        );

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
