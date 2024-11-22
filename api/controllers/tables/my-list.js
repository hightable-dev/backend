/**
 * @author mohan <mohan@studioq.co.in>
 */


const DataService = require('../../services/DataService');

module.exports = function list(request, response) {

  const request_query = request.allParams();
  let { page, limit, id: creatorId } = request_query;

  const input_attributes = [
    { name: 'page', number: true, min: 1 },
    { name: 'limit', number: true, min: 1 }
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
      items: _.cloneDeep(items),
    };

    response.ok(responseObject);

    process.nextTick(() => {
      const relativePath = SwaggerGenService.getRelativePath(__filename);
      UseDataService.processSwaggerGeneration({ relativePath, inputAttributes: input_attributes, responseObject });

    });

    return
  };


  function buildCriteria(category) {
    let criteria = {};

    if (creatorId) {
      /****To view list of table created by host for other users****/
      criteria.status = { '!=': UseDataService.listingTableStatusNotEqual };
      // Filter out status 0 if status array is empty or undefined
    } else {
      /****To view list of table created self****/
      criteria.status = { '!=': [0] };
    }

    if (category) {
      criteria.category = category;
    }
    criteria.created_by = creatorId ? creatorId : parseInt(ProfileMemberId(request));
    return criteria;
  }


  function tablePhoto(item) {
    try {
      const mediaData = DataService.processMediaData({
        media: item.media,
        video: item.video,
        size: {
          photo: DataService.resolution.standardResolution.name,
          video: ''
        }
      });
      item.media = mediaData.media || null;
      item.video = mediaData.video || null;

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
          item.event_date = UseDataService.dateHelper(item.event_date, 'YYYY-MM-DD HH:mm', 'DD-MM-YYYY HH:mm');
          await tablePhoto(item);

        }));

        const totalItems = await Tables.count({ where: criteria });

        sendResponse(items, totalItems);
      } catch (error) {
        console.error('Error retrieving service requests:', error);
        return response.serverError('Server Error');
      }

    } else {
      responseObject = {
        errors: errors,
        count: errors.length
      };
      return response.badRequest(responseObject);
    }
  });
};