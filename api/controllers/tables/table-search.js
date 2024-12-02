const _ = require('lodash');

module.exports = function list(request, response) {
  const userType = UserType(request);

  let responseObject = {};
  const request_query = request.allParams();
  let { page, limit, } = request_query;
  const filtered_query_data = _.pick(request_query, [
    'page', 'sort', 'limit', 'search', 'date', 'to', 'category', 'address'
  ]);

  let { search, from: from_date, to: end_date, category, address } = request?.body;

  const input_attributes = [
    { name: 'page', number: true, min: 1 },
    { name: 'limit', number: true, min: 1 },
  ];

  const sendResponse = (items) => {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    responseObject = {
      message: 'Request form list retrieved successfully.',
      meta: {
        total: items.length,
        page: pageNum,
        limit: limitNum,
        ...sails.config.custom.s3_bucket_options
      },
      items,
    };

    response.ok(responseObject);
    process.nextTick(() => {
      const relativePath = SwaggerGenService.getRelativePath(__filename);
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

    return;
  };

  async function buildCriteria(category, address, from_date, to_date) {

    let criteria = {}
    criteria = await UseDataService.tableListingCriteria({ userType, category, address, from_date, to_date })
    console.log({ criteria })

    // if (address) {
    //   const locality = await UseDataService.locationUtils.geocodeLocation(address);
    //   const { latitude, longitude } = locality
    //   const getLocalCity = await UseDataService.locationUtils
    //     .extractLocationDetails({
    //       x: latitude,
    //       y: longitude,
    //     })
    //   findByCity = getLocalCity?.city;
    //   findByDistrict = getLocalCity?.district.split(' ')[0];
    //   console.log("LIST BY ADDRESS", { address, latitude, longitude, getLocalCity, findCity })

    //   // findCity = findCity[0];
    //   // console.log({ address, findCity })
    //   wordCount = _.size(_.split(_.replace(address.split(',')[0], /[^a-zA-Z\s]/g, ''), ' '));
    //   criteria = {
    //     ...criteria,
    //     ...(wordCount > 1 ? { address: address ? { contains: address } : null } : { district: findByDistrict ? { contains: findByDistrict } : null })
    //   };

    // } else {
    //   criteria = {
    //     address: address ? { contains: address } : null,
    //   }
    // }

    return criteria;
  }


  validateModel.validate(null, input_attributes, filtered_query_data, async function (valid, errors) {
    if (valid) {
      try {
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;
        const criteria = await buildCriteria(category, address, from_date, end_date);

        let items = await Tables.find({ where: criteria })
          .sort('event_date ASC')
          .skip(skip)
          .limit(limit)
          .populate('category')
          .populate('user_profile')

        let itemsCount = await Tables.count({ where: criteria });
        // Apply multi-column search
        if (search) {
          const searchColumns = ['title', 'description'];
          items = await UseDataService.searchCriteria(search, items, searchColumns);
        }

        await Promise.all(items.map((item) => {
          item.media = item?.media ? item.media[0] : 'image-1_1.webp';
          item.video = item?.video ? item.media[0] : null;
          item.event_date = UseDataService.dateHelper(item.event_date, 'YYYY-MM-DD HH:mm', 'DD-MM-YYYY HH:mm');
        }));

        sendResponse(items, itemsCount);
      } catch (error) {
        console.error('Error retrieving service requests:', error);
        return response.serverError('Server Error');
      }
    } else {
      responseObject = {
        errors: errors,
        count: errors.length,
      };
      return response.status(400).json(responseObject);
    }
  });
};
