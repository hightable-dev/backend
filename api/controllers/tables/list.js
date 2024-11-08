const DataService = require('../../services/DataService');

module.exports = async function list(request, response) {
  const request_query = request.allParams();
  const filtered_query_data = _.pick(request_query, [
    'page', 'sort', 'limit', 'city', 'address','category'
  ]);
  let { page, limit, category, address,} = filtered_query_data;
  const input_attributes = [
    { name: 'page', number: true, min: 1 },
    { name: 'limit', number: true, min: 1 },
  ];

  const tablesPhoto = sails.config.custom.filePath.tablesMedia;
  const tablesVideo = sails.config.custom.filePath.tablesVideo;


  // const swaggerDoc = SwaggerGenService.generateSwaggerEndpoint({
  //   key: "/tables/list",
  //   Tags: "Tables",
  //   Description: "Retrieve a list of tables based on various filters.",
  //   data: {
  //     page,
  //     limit,
  //     search,
  //     from_date,
  //     to_date,
  //     category,
  //     created_by,
  //     type,
  //   },
  // });

  // console.log('Swagger Documentation:', swaggerDoc);
  const sendResponse = (items ) => {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    return response.ok({
      message: 'Request form list retrieved successfully.',
      meta: {
        total: items.length,
        page: pageNum,
        limit: limitNum,
        media: tablesPhoto,
        video: tablesVideo,
      },
      items: items,
    });
  };


  function buildCriteria(category) {
    let criteria = {
      status: { '!=': DataService.listingTableStatusNotEqual },
      event_date: { '>=': DataService.formatDate.ddmmyyyy_hhmm() },
    };

    // criteria.event_date = { '>=': formattedDate };
    /***
     * Ex Current date is 16 Aug 2024 12:50 Pm
     * Event Dates Followed by
     * 16-08-2024 05:03 Not listed
     * 16-08-2024 12:49 Not listed
     * 16-08-2024 14:03 listed
     * 31-08-2024 14:03 listed
     */
    console.log('category',category)
    if (category) criteria.category = category;
    

    return criteria;
  }

  validateModel.validate(null, input_attributes, filtered_query_data, async function (valid, errors) {
    if (valid) {
      try {
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;
        const criteria = buildCriteria(category);

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
        if (address) {
          console.log('address 125',address)
          const addressColumns = ['state', 'city', 'address'];
          items = await DataService.searchCriteria(address, items, addressColumns);
        }

        // Rename `created_by` to `user_profile` and process items concurrently

        await Promise.all(
          items
            .map(async item => {
              // Perform transformations only on items that passed the filter
              item.media = item.media ? tablesPhoto + item.media : tablesPhoto + 'tables-media-1.png';
              if (item.event_date) {
                item.event_date = DataService.formatDate.ddmmyyyy_hhmm(item.event_date);
              }
              item.video = item.video ? tablesVideo + item.video : null;
              if (item.user_profile?.photo) {
                item.user_profile.photo = sails.config.custom.filePath.members + item.user_profile?.photo;
              }
              return item; // Return the transformed item
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
