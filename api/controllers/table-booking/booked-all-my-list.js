
module.exports = function list(request, response) {

  const request_query = request.allParams();
  const filtered_query_data = _.pick(request_query, [
    "page",
    "sort",
    "limit",
    "search",
  ]);
  let { page, limit } = filtered_query_data;
  const input_attributes = [
    { name: "page", number: true, min: 1 },
    { name: "limit", number: true, min: 1 },
  ];

  const sendResponse = (items, total) => {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    response.ok({
      message: "Request form list retrieved successfully.",
      meta: {
        count: items.length,
        total: total,
        page: pageNum,
        limit: limitNum,
        ...sails.config.custom.s3_bucket_options,
      },
      items: items,
    });

 /*    process.nextTick(() => {
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
        params: {},
        required_data: input_attributes,
        response: items
      });
    }); */

    return;
  };

  function buildCriteria() {
    let criteria = {
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
          const criteria = buildCriteria();

          // Fetch items and total count in parallel
          let [items, totalItems] = await Promise.all([
            TableBooking.find({ where: criteria })
              .skip(skip)
              .limit(limit)
              .populate("table_id")
              .populate("creator_id"),
            TableBooking.count({ where: criteria }),
          ]);

          await Promise.all(
            items.map(async (item) => {
              if (item.table_id) {
                // Fetch the category from the table_id if it's not already populated
                const tableDetails = await Tables.findOne({
                  id: item.table_id.id,
                }).populate("category"); // Populate category here

                // Assign populated category back to item
                item.table_id.category = tableDetails.category;
              }

              if (UserType(request) === roles.member) {
                if (item.user_id.photo) {
                  item.user_id.photo =
                    sails.config.custom.s3_bucket_options.profile_photo +
                    item.user_id.photo;
                }

                if (item.user_id?.phone) {
                  item.user_id.phone = await UseDataService.phoneCrypto.decryptPhone(item.user_id?.phone);
                }
              }

              // Perform transformations only on items that passed the filter
              if (item.table_id?.event_date) {
                item.table_id.event_date = await UseDataService.dateHelper(item.table_id?.event_date, 'YYYY-MM-DDTHH:mm:ss.SSSZ', 'DD-MM-YYYY HH:mm');
              }

              if (item.table_id?.media) {
                item.table_id.media = item.table_id.media[0];
              }
              if (item?.phone) {
              
                item.phone = item?.phone ? await UseDataService.phoneCrypto.decryptPhone(item?.phone) : null;
              }
  console.log({item})
              item.table_details = item.table_id;
              item.creator_details = item.creator_id;
              delete item.table_id;
              delete item.creator_id;

              return item; // Return the transformed item
            })
          );

          

          // await processBookingCounts(items);
          // await Promise.all(items.map(decryptPhoneNumber));

          sendResponse(items, totalItems);
        } catch (error) {
          console.error("Error retrieving service requests:", error);
          return response.serverError("Server Error");
        }
      } else {
        return response.status(400).json({
          errors: errors,
          count: errors.length,
        });
      }
    }
  );
};
