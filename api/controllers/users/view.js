
module.exports = async function findOne(request, response) {
  try {
    var _response_object = {};
    const logged_in_user = request.user;

    // Find table by ID
    const specificUsers = await Users.find(logged_in_user?.id).limit(1); // Use .find().limit(1) instead of findOne()

    // Check if table exists
    if (!specificUsers || specificUsers.length === 0) {
      return response.status(404).json({ error: 'Table not found' }); // Customize error message here
    }

    const user = specificUsers[0]; // Retrieve the first user from the result

    // user.category = parseInt(user.category);
    // user.created_by = parseInt(user.created_by);
    // user.media = sails.config.custom.filePath.tables + user.media;

    // Send response
    _response_object = {
      message: 'Table retrieved successfully.',
      data: user, // Use the retrieved user
    }

    return response.ok(_response_object);
  } catch (error) {
    console.error("Error occurred while fetching table:", error);
    return response.status(500).json({ error: "Error occurred while fetching table" });
  }
}
