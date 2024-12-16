module.exports =  function list(request, response) {
  const request_query = request.allParams();
  const filtered_query_data = _.pick(request_query, [
    "page",
    "sort",
    "limit",
    "search",
    "date",
    "to",
    "category",
    "status",
    "created_by",
    "type",
  ]);
  let {
    page,
    limit,
    search,
    date: from_date,
    to: to_date,
    category,
    status,
  } = filtered_query_data;
  const input_attributes = [
    { name: "page", number: true, min: 1 },
    { name: "limit", number: true, min: 1 },
  ];

  const tablesPhoto = sails.config.custom.filePath.tablesMedia;
  const tablesVideo = sails.config.custom.filePath.tablesVideo;

  const sendResponse = (items, total) => {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    return response.ok({
      message: "Request form list retrieved successfully.",
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
    let criteria = {};
    if (status) {
      criteria.status = status;
    }
    /***
     * Ex Current date is 16 Aug 2024 12:50 Pm
     * Event Dates Followed by
     * 16-08-2024 05:03 Not listed
     * 16-08-2024 12:49 Not listed
     * 16-08-2024 14:03 listed
     * 31-08-2024 14:03 listed
     */

    if (search) {
      const searchValue = search.trim();
      const lookupFields = ["first_name", "last_name"];
      const searchVariations = [
        searchValue.toLowerCase(),
        _.capitalize(searchValue),
        searchValue.toUpperCase(),
      ];

      const searchCriteria = lookupFields.map((field) => ({
        or: searchVariations.map((variation) => ({
          [field]: { contains: variation },
        })),
      }));

      criteria.or = criteria.or || [];
      criteria.or.push(...searchCriteria);
    }
    return criteria;
  }



  validateModel.validate(
    null,
    input_attributes,
    filtered_query_data,
    async function (valid, errors) {
      if (valid) {
        try {
          page = parseInt(page) || 1;
          limit = parseInt(limit) || 10;
          const skip = (page - 1) * limit;
          const criteria = buildCriteria(search, category, from_date, to_date);

          // Fetch items and total count in parallel
          let [items, totalItems] = await Promise.all([
            ProfileMembers.find({ where: criteria }).skip(skip).limit(limit),
            ProfileMembers.count({ where: criteria }),
          ]);
          // await processBookingCounts(items);
          await Promise.all(items.map(async (item) => {
            item.phone = item.phone ? await UseDataService.phoneCrypto.decryptPhone(item.phone) : null;
          }));
          
          sendResponse(items, totalItems);
        } catch (error) {
          return response.serverError({error});
        }
      } else {
        return response.badRequest({
          errors: errors,
          count: errors.length,
        });
      }
    }
  );
};
