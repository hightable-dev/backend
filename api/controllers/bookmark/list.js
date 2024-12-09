/**
 * @author mohan <mohan@studioq.co.in>
 */

module.exports = function list(request, response) {
  const { bookmarkTable } = UseDataService;
  const request_query = request.allParams();
  const filtered_query_data = _.pick(request_query, [
    'page', 'limit', 'category', 'address', 'city'
  ]);
  let { page, limit, category } = filtered_query_data;

  const input_attributes = [
    { name: 'page', number: true, min: 1 },
    { name: 'limit', number: true, min: 1 },
  ];

  const sendResponse = (items, totalItems) => {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    response.ok({
      message: 'Tables retrieved successfully.',
      meta: {
        total: totalItems,
        page: pageNum,
        limit: limitNum,
        ...sails.config.custom.s3_bucket_options,
      },
      items: items,
    });

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
        response: items
      });
    });

    return;


  };

  function buildCriteria() {
    let criteria = {
      status: bookmarkTable,
      user_id: ProfileMemberId(request),
    };

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
          BookMarks.find({ where: criteria })
            .skip(skip)
            .limit(limit)
            .populate('table_id')
            .populate('creator_profile_id')
            .then(async (bookmarks) => {
              // Populate 'category' in 'table_id' for each bookmark
              await Promise.all(bookmarks.map(async bookmark => {
                if (bookmark.table_id) {
                  bookmark.table_id.category = await Interests.findOne({ id: bookmark.table_id.category });
                }
              }));

              return bookmarks;
            }),
          BookMarks.count({ where: criteria })
        ]);

        await Promise.all(
          items.map( item => {
            if (item.table_id?.event_date) {
              item.table_id.event_date = UseDataService.dateHelper(item.table_id?.event_date, 'YYYY-MM-DDTHH:mm:ss.SSSZ', 'DD-MM-YYYY HH:mm:ss');
            }
            item.media = item.media ? item.media[0] : null;
            item.table_details = item.table_id;
            delete item.table_id;
            return item;
          })
        );

        sendResponse(items, totalItems);
      } catch (error) {
        return response.serverError('Server Error');
      }
    } else {
      return response.badRequest({
        errors: errors,
        count: errors.length,
      });
    }
  });
};
