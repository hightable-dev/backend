/**
 * @author mohan <mohan@studioq.co.in>
 */

/* global _, ProfileManagers /sails */

const moment = require('moment');

module.exports = async function list(request, response) {

  const profileId = request.user.profile_members;
  try {
    var _response_object = {};

    const request_query = request.allParams();
    const filtered_query_data = _.pick(request_query, ['page', 'limit']);
    const filterData = ["payment_details", "created_at", "updated_at"]; // Specify fields to filter
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

        // Fetch user's selected interests
        const user = await ProfileMembers.findOne({ id: parseInt(profileId) });
        const userSelectedInterest = user?.interests;


        // Filter interests based on user's selected interests
        const filteredInterests = interests.filter(interest => userSelectedInterest?.includes(interest.id));

      const  filteredItems = common.filterDataItems(filteredInterests, filterData);
        // Format interests data
        for (const item of filteredItems) {
          try {
            if (item.image) {
              // Add prefix to media property
              item.image = sails.config.custom.filePath.interests + item.image;
            }
          } catch (error) {
            console.error("Error finding user or category details:", error);
          }
        }

        // Send response
        _response_object.message = 'Interests retrieved successfully.';
        _response_object.meta = {
          page: page,
          limit: limit,
          total: filteredInterests.length
        };

        _response_object.items = filteredInterests;

        return response.ok(_response_object);
      } else {
        _response_object.errors = errors;
        _response_object.count = errors.length;
        return response.status(400).json(_response_object);
      }
    });
  } catch (error) {
    console.error("Error occurred while fetching interests:", error);
    return response.status(500).json({ error: "Error occurred while fetching interests" });
  }
}
