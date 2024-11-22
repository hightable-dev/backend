/**
 * @author mohan <mohan@studioq.co.in>
 */

/* global _, ProfileManagers /sails */


module.exports = function list(request, response) {
  try {
    var responseObject = {};

    const request_query = request.allParams();
    const filtered_query_data = _.pick(request_query, ['page', 'limit']);

    var input_attributes = [
      { name: 'page', number: true, min: 1 },
      { name: 'limit', number: true, min: 1 }
    ];

    validateModel.validate(null, input_attributes, filtered_query_data, async function (valid, errors) {
      if (valid) {
        const page = parseInt(filtered_query_data.page) || 1;
        const limit = parseInt(filtered_query_data.limit) || 10;
        const skip = (page - 1) * limit;

        // Fetch interests with pagination
        const interests = await Interests.find().skip(skip).limit(limit);

        // Send response
        responseObject.message = 'Interests retrieved successfully.';
        responseObject.meta = {
          page: page,
          limit: limit,
          total: interests.length
        };

        responseObject.items = interests;

        return response.ok(responseObject);
      } else {
        responseObject.errors = errors;
        responseObject.count = errors.length;
        return response.status(400).json(responseObject);
      }
    });
  } catch (error) {
    console.error("Error occurred while fetching interests:", error);
    return response.status(500).json({ error: "Error occurred while fetching interests" });
  }
}
