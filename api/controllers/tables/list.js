/**
 * @author mohan
 * <mohan@studioq.co.in>
 */
/* global _, ProfileManagers, sails */
const _ = require('lodash');

module.exports = async function list(request, response) {
  const { errorMessages } = UseDataService;
  const userType = UserType(request);

  try {
    const requestQuery = request.allParams();
    const validParams = ['page', 'limit','search','category', 'address','type'];

    const filteredQueryData = _.pickBy(requestQuery, (value, key) => validParams.includes(key) && _.identity(value));

    const { type: tableType, status: tableStatus, category, search } = filteredQueryData;


    // Check for invalid keys
    const invalidParams = _.difference(Object.keys(requestQuery), validParams);
    if (invalidParams.length > 0) {
      // Throw an error for invalid parameters
      throw ({
        status: errorMessages.badRequest,
        message: `Invalid parameters passed - ${invalidParams.join(', ')}`
      });
    }

    // Exclude fields from the results
    const excludeFields = ['created_at', 'updated_at'];

    // Input validation schema
    const inputAttributes = [
      { name: 'page', number: true, min: 1 },
      { name: 'limit', number: true, min: 1 },
    ];

    // Define the function to build the criteria based on the filtered data
    async function buildCriteria() {
      let criteria = {}
      // criteria = UseDataService.tableListingCriteria({ userType, tableType, category, address, tableStatus })
      criteria = UseDataService.tableListingCriteriaWithoutLocation({ userType, tableType, category, tableStatus })
      // Handle search functionality


      return criteria;
    }
    // Validate inputs
    await validateModel.validate(Tables, inputAttributes, filteredQueryData, async (valid, errors) => {
      if (!valid) {
        // Handle validation errors
        return response.badRequest({
          errors,
          count: errors.length,
        });
      }

      const page = parseInt(filteredQueryData.page) || 1;
      const limit = parseInt(filteredQueryData.limit) || 5;
      const skip = (page - 1) * limit;

      try {
        let criteria = await buildCriteria();

        if (search) {
          const searchValue = search.trim();
          const lookupFields = ['full_name', 'address', 'title'];
          const searchVariations = [
            searchValue.toLowerCase(),
            _.capitalize(searchValue),
            searchValue.toUpperCase(),
          ];

          const searchCriteria = lookupFields.map((field) => ({
            or: searchVariations.map((variation) => ({ [field]: { contains: variation } })),
          }));

          criteria.or = criteria.or || [];
          criteria.or.push(...searchCriteria);
        }

        const [items, totalItems] = await Promise.all([
          Tables.find()
            .where(criteria)
            .skip(skip)
            .limit(limit)
            .omit(excludeFields)
            .populate('category')
            .populate('user_profile'),
          Tables.count().where(criteria),
        ]);

        // Send paginated response
        await UseDataService.sendResponseList({
          items,
          totalItems,
          page,
          limit,
          response,
          inputAttributes,
          filePath:  SwaggerGenService.getRelativePath(__filename),
          message: 'Tables list',
        });

      } catch (e) {
        // Handle errors while fetching data
        return response.serverError({
          ...UseDataService.errorMessages.fetchTables,
          error: e.message,
        });
      }
    });

  } catch (error) {
    // Catch any unexpected errors and send the response
    throw error;
  }
};
