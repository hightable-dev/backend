/**
 * @author mohan <mohan@studioq.co.in>
 */


const moment = require('moment');
const common = require('../../services/common');
const DataService = require('../../services/DataService');

module.exports = function list(request, response) {
  const { tablesVideo, tablesPhoto } = file_path;

  const request_query = request.allParams();
  let { page, limit, search, date, to, category ,id:creatorId } = request_query;

  const input_attributes = [
    { name: 'page', number: true, min: 1 },
    { name: 'limit', number: true, min: 1 }
  ];


  const sendResponse = (items, total) => {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    _response_object = {
      message: 'Request form list retrieved successfully.',
      meta: {
        count: items.length,
        total: total,
        page: pageNum,
        limit: limitNum,
      },
      items: _.cloneDeep(items),
    };

    return response.ok(_response_object);
  };


  function buildCriteria(category, search, from_date, to_date) {
    let criteria = {};

    criteria.status = { '!=': [0,6] }; // Filter out status 0 if status array is empty or undefined
    if (category) {
      criteria.category = category;
    }
    criteria.created_by = creatorId ? creatorId : parseInt(ProfileMemberId(request)) ;
    return criteria;
  }


  async function tablePhoto(item) {
    try {
      item.media = item.media ? tablesPhoto + item.media : null;
      item.video = item.video ? tablesVideo + item.video : null;

      if (!item.media && !item.video) {
        item.media = tablesPhoto + 'tables-media-1.png';
      }

    } catch (error) {
      console.error("Error processing item media:", error);
      throw error;
    }
  }


  validateModel.validate(null, input_attributes, { page, limit }, async function (valid, errors) {
    if (valid) {
      try {

        page = parseInt(page) || 1;
        limit = parseInt(limit) || 5;
        const skip = (page - 1) * limit;
        const criteria = buildCriteria();

        let items = await Tables.find({ where: criteria })
          .sort('created_at DESC')
          .skip(skip)
          .limit(limit)
          .populate('category');

          await Promise.all(items.map(async (item) => {
            item.event_date = DataService.formatDate.ddmmyyyy_hhmm(item.event_date)
            await tablePhoto(item);
            
          }));
          
        const totalItems = await Tables.count({ where: criteria });
        sendResponse(items, totalItems);
      } catch(error) {
        console.error('Error retrieving service requests:', error);
        return response.serverError('Server Error');
      }

    } else {
      const _response_object = {
        errors: errors,
        count: errors.length
      };
      return response.badRequest(_response_object);
    }
  });
};