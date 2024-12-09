
module.exports = function list(request, response) {
  // const userType = UserType(request);
  const request_query = request.allParams();
  const filtered_query_data = _.pick(request_query, [
    'address', 'latlng', 'page', 'limit'
  ]);
  let { page, limit, address } = filtered_query_data;

  const input_attributes = [
    { name: 'address'}
  ];

  let responseObject = {};
  const sendResponse = (items, total) => {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    responseObject = {
      message: 'Request form list retrieved successfully.',
      meta: {
        count: items.length,
        total: total,
        page: pageNum,
        limit: limitNum,
        ...sails.config.custom.s3_bucket_options,
      },
      items: items,
    };

    response.ok(responseObject)
    /* 
     Generates the swagger
    */

    process.nextTick(() => {
      const relativePath = SwaggerGenService.getRelativePath(__filename);
      const capitalizeFirstLetter = (str) => {
        if (typeof str !== 'string' || str.length === 0) return str;
        return str.charAt(0).toUpperCase() + str.slice(1);
      };
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
    return;
  };

  /* 
   Build criteria 
   used write logics and used filter data for the response
  */

  async function buildCriteria() {
    let criteria = {};

    // criteria = await UseDataService.tableListingCriteria({ userType, address })
    criteria = await UseDataService.tableListingCriteriaWithoutLocationPublic({})

    return criteria;
  }

  validateModel.validate(null, input_attributes, filtered_query_data, async function (valid, errors) {
    if (valid) {
      try {
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 7;
        const skip = (page - 1) * limit;
        let criteria = await buildCriteria();

        // Fetch items and total count in parallel
        let [items, totalItems] = await Promise.all([
          Tables.find({ where: criteria })
            // .sort({ type: -1, booked: -1 })
            .skip(skip)
            .limit(limit)
            .populate('category')
            .populate('user_profile'),
          // Tables.count({ where: criteria })
        ]);

        // Rename `created_by` to `user_profile` and process items concurrently
        // if (address) {
        //   const addressColumns = ['state', 'city', 'address', 'format_geo_address'];
        //   items = await DataService.searchCriteria(address, items, addressColumns);
        // }


        await Promise.all(items.map(async (item) => {
          item.media = item?.media ? item.media[0] : 'image-1_1.webp';
          item.video = item?.video ? item.media[0] : null;
          item.event_date = UseDataService.dateHelper(item.event_date, 'YYYY-MM-DD HH:mm', 'DD-MM-YYYY HH:mm');
          // const checkBookingStatus = await UseDataService.getBookingStatus(request, item.id);
          // item.booking_status = checkBookingStatus?.tableBookingStatus?.status ?? null;
          // item.booking_close = checkBookingStatus?.tableBookingClose;

        }));






        sendResponse(items, totalItems);
      } catch (error) {
        return response.serverError({message:'Error retrieving list', error});
      }
    } else {
      return response.badRequest({
        errors: errors,
        count: errors.length,
      });
    }
  });
};
