const _ = require('lodash');
const moment = require('moment');
const DataService = require('../../services/DataService');

module.exports = async function list(request, response) {

  let _response_object = {};
  const request_query = request.allParams();
  let { page, limit } = request_query;
  const filtered_query_data = _.pick(request_query, [
    'page', 'sort', 'limit', 'search', 'date', 'to', 'category', 'address'
  ]);

  let { search, from: from_date, to: end_date, category, address } = request?.body;
  const input_attributes = [
    { name: 'page', number: true, min: 1 },
    { name: 'limit', number: true, min: 1 },
  ];
  console.log("dfdadaff body", request.body)

  const tablesPhoto = sails.config.custom.filePath.tablesMedia;
  const tablesVideo = sails.config.custom.filePath.tablesVideo;

  const sendResponse = (items) => {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    _response_object = {
      message: 'Request form list retrieved successfully.',
      meta: {
        total: items.length,
        page: pageNum,
        limit: limitNum,
        media: tablesPhoto,
        video: tablesVideo,
      },
      items: _.cloneDeep(items),
    };


    return response.ok(_response_object);
  };

  function buildCriteria(category, search, address, from_date, to_date) {
    let criteria = {};

    // Filter out statuses: inactive, pending, cancelled, deletedAccountTables
    criteria = {
      status: { '!=': DataService.listingTableStatusNotEqual },
      event_date: { '>=': DataService.formatDate.ddmmyyyy_hhmm() },
    };
    if (address) {
      // Using 'contains' for partial address matching; adjust if exact match is needed
      criteria.address = { contains: address };
  }

    // Category filter
    if (category) {
      criteria.category = category;
    }
    // Date filter
    if (from_date && to_date) {

      const startDate = moment(from_date, 'DD-MM-YYYY').startOf('day');
      const endDate = moment(to_date, 'DD-MM-YYYY').endOf('day');

      if (!startDate.isValid() || !endDate.isValid()) {
        throw new Error("Invalid date format. Please provide the date in DD-MM-YYYY format.");
      }

      criteria.event_date = {
        '>=': startDate.format('DD-MM-YYYY HH:mm:ss'),
        '<=': endDate.format('DD-MM-YYYY HH:mm:ss')
      };
    } else if (from_date) {
      const parsedDate = moment(from_date, 'DD-MM-YYYY');

      if (!parsedDate.isValid()) {
        throw new Error("Invalid date format. Please provide the date in DD-MM-YYYY format.");
      }
      criteria.event_date = parsedDate.format('DD-MM-YYYY');
    }
    return criteria;
  }

  // Multi-column search function

  validateModel.validate(null, input_attributes, filtered_query_data, async function (valid, errors) {
    if (valid) {
      try {
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;
        const criteria = await buildCriteria(category, search, address, from_date, end_date);

        let items = await Tables.find({ where: criteria })
          .sort('event_date ASC')
          .skip(skip)
          .limit(limit)
          .populate('category')
          .populate('user_profile');
          let itemsCount = await Tables.count({ where: criteria })
          console.log('itemsCount',itemsCount)

        // Apply multi-column search
        if (search) {
          const searchColumns = ['title', 'description'];
          items = await DataService.searchCriteria(search, items, searchColumns);
        }

        // if (address) {
        //   const addressColumns = ['state', 'city', 'address'];
        //   items = await DataService.searchCriteria(address, items, addressColumns);
        // }
        // Process items using map and Promise.all
        await Promise.all(items.map(async (item) => {
          item.media = item.media ? tablesPhoto + item.media : null;
          item.video = item.video ? tablesVideo + item.video : null;
          item.event_date = DataService.formatDate.ddmmyyyy_hhmm(item.event_date);
          if (item.user_profile?.photo) {
            item.user_profile.photo = sails.config.custom.filePath.members + item.user_profile?.photo;
          }
          if (item.event_date) {
            item.event_date = DataService.formatDate.ddmmyyyy_hhmm(item.event_date);
          }
          if (!item.media && !item.video) {
            item.media = tablesPhoto + 'tables-media-1.png';
          }
        }));

        sendResponse(items);
      } catch (error) {
        console.error('Error retrieving service requests:', error);
        return response.serverError('Server Error');
      }
    } else {
      _response_object = {
        errors: errors,
        count: errors.length,
      };
      return response.status(400).json(_response_object);
    }
  });
};
