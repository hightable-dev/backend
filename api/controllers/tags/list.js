/**
 * @author mohan
 * <mohan@studioq.co.in>
 */
/* global _, ProfileManagers, sails */
const _ = require('lodash');

module.exports = async function list(request, response) {
  const {errorMessages} = UseDataService;

  try {
    const requestQuery = request.allParams();
    const validFields = ['page', 'limit'];

    const filteredQueryData = _.pickBy(requestQuery, (value, key) => validFields.includes(key) && _.identity(value));

    // Check for invalid keys
    const invalidParams = _.difference(Object.keys(requestQuery), validFields);
    if (invalidParams.length > 0) {
      // Throw an error for invalid parameters
      throw ({
        status: errorMessages.badRequest,
        message:`Invalid parameters passed - ${invalidParams.join(', ')}`
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
    async function buildCriteria(filteredData) {
      let criteria = {};

      // Dynamically build criteria based on the provided filters (e.g., category, status)
      return criteria;
    }

    // Validate inputs
    await validateModel.validate(Interests, inputAttributes, filteredQueryData, async (valid, errors) => {
      if (!valid) {
        // Handle validation errors
        return response.badRequest({
          errors,
          count: errors.length,
        });
      }

      const page = parseInt(filteredQueryData.page) || 1;
      const limit = parseInt(filteredQueryData.limit) || 10;
      const skip = (page - 1) * limit;

      try {
        // Build the dynamic criteria based on the filtered data
        let criteria = await buildCriteria(filteredQueryData);

        // Fetch the paginated list and count based on the criteria
        const [items, totalItems] = await Promise.all([
          Tags.find()
            .where(criteria)
            .skip(skip)
            .limit(limit)
            .omit(excludeFields),
          Tags.count().where(criteria),
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
          message: 'Tags list',
        });

      } catch (e) {
        // Handle errors while fetching data
        return response.serverError({
          ...UseDataService.errorMessages.fetchTags,
          error: e.message,
        });
      }
    });

  } catch (error) {
    // Catch any unexpected errors and send the response
    throw error;
  }
};
