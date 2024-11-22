/**
 * @author mohan <mohan@studioq.co.in>
 */

/* global _, ProfileManagers /sails */

module.exports = async function findOne(request, response) {
  try {
    var _response_object = {};

    // Extract ID from request parameters
    const { id: managerId } = request.query;
    const filterData = ['payment_details', 'facebook_data', 'created_at', 'updated_at']; // Specify fields to filter

    // Find user by ID
    // const specificUsers = await Users.find({ id }).limit(1); // Use .find().limit(1) instead of findOne()
    const specificUsers = await ProfileManagers.find({ id: managerId }).limit(1); // Use .find().limit(1) instead of findOne()
    // const totalTablesCount = await Tables.count({ admin_id:ProfileManagerId(request)});
    const totalTablesCount = await Tables.count({ where: { admin_id: managerId } });

    // Check if user exists
    if (!specificUsers || specificUsers.length === 0) {
      return response.status(404).json({ error: 'User not found' }); // Customize error message here
    }
    let filteredItems = specificUsers;
    filteredItems = common.filterDataItems(filteredItems, filterData);



    const user = specificUsers[0]; // Retrieve the first user from the result
    user.tableCreatedCount = totalTablesCount;

    if (user.photo) {
      user.photo = sails.config.custom.s3_bucket_options.profile_photo + user.photo;
    }

    // Send response
    _response_object = {
      message: 'User retrieved successfully.',
      data: user, // Use the retrieved user
    }

    return response.ok(_response_object);
  } catch (error) {
    console.error("Error occurred while fetching user:", error);
    return response.status(500).json({ error: "Error occurred while fetching user" });
  }
}
