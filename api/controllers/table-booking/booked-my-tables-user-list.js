/**
 * @author mohan
 * <mohan@studioq.co.in>
 */

/* global _, ProfileManagers, sails */

module.exports = async function list(request, response) {
  try {
    const { phoneCrypto, paymentSuccess } = UseDataService; // Assuming this is defined in UseDataService
    const requestQuery = request.query;
    const filteredQueryData = _.pick(requestQuery, [
      "page",
      "limit",
      "table_id",
    ]);
    const selectFields = [
      "id",
      "user_id",
      "table_id",
      "creator_id",
      "user_details",
    ];

    // Input validation schema
    const inputAttributes = [
      { name: "page", number: true, min: 1 },
      { name: "limit", number: true, min: 1 },
    ];

    async function buildCriteria() {
      let criteria = {};
      criteria.table_id = filteredQueryData.table_id;
      criteria.creator_id = ProfileMemberId(request);
      criteria.status = paymentSuccess;

      return criteria;
    }

    // Validate inputs
    validateModel.validate(
      TableBooking,
      inputAttributes,
      filteredQueryData,
      async (valid, errors) => {
        if (valid) {
          const page = parseInt(filteredQueryData.page) || 1;
          const limit = parseInt(filteredQueryData.limit) || 5;
          const skip = (page - 1) * limit;

          let criteria = await buildCriteria();
          // Fetch data with pagination
          const [items, totalItems] = await Promise.all([
            TableBooking.find({ where: criteria })
              .skip(skip)
              .limit(limit)
              .select(selectFields),
            // .omit(excludeFields),
            TableBooking.count({ where: criteria }),
          ]);

          for (let item of items) {
            if (item.user_details?.phone) {
              // Assuming 'phone' is the encrypted phone number for each item
              item.user_details.phone = UseDataService.phoneCrypto.decryptPhone(
                item.user_details?.phone
              );
            }
          }

          // Use the refactored sendResponseList function
          await UseDataService.sendResponseList({
            items,
            totalItems,
            page,
            limit,
            response,
            inputAttributes,
            // filePath: __filename,
            message: "Booked users list",
          });
        } else {
          // Handle validation errors
          return response.badRequest({
            errors,
            count: errors.length,
          });
        }
      }
    );
  } catch (error) {
    sails.log.error("Error in list:", error);
    return response.serverError({
      error: "Error occurred while fetching interests",
    });
  }
};
