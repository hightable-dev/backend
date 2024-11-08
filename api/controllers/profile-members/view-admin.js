/**
 * @author mohan <mohan@studioq.co.in>
 */

/* global _, ProfileManagers /sails */

module.exports = async function findOne(request, response) {
  try {
    var _response_object = {};

    // Extract ID from request parameters
    const { id } = request.query;
    const filterData = ['payment_details','facebook_data', 'created_at', 'updated_at']; // Specify fields to filter

    // Find user by ID
    // const specificUsers = await Users.find({ id }).limit(1); // Use .find().limit(1) instead of findOne()
    const specificUsers = await ProfileMembers.find({ id }).limit(1); // Use .find().limit(1) instead of findOne()

    // Check if user exists
    if (!specificUsers || specificUsers.length === 0) {
      return response.status(404).json({ error: 'User not found' }); // Customize error message here
    }
    let filteredItems = specificUsers ;
    filteredItems = common.filterDataItems(filteredItems, filterData);
    const userBookingCounts = new Map();
    for (const item of filteredItems) {
      if(item) {
        const totalTablesCount = await Tables.count({ created_by: item.id });
        item.tablesHosted = totalTablesCount; 

        const totalBookedCount = await TableBooking.count({ user_id: item.id });
        // Increment booking count for the user ID
        userBookingCounts.set(item.id, (userBookingCounts.get(item.id) || 0) + totalBookedCount); 


      }
    }

    const user = specificUsers[0]; // Retrieve the first user from the result
    user.photo = sails.config.custom.filePath.members + user.photo;
    if (user.phone) {
      await phoneEncryptor.decrypt(user.phone, function (decrypted_text) {
        user.phone = decrypted_text;
      });
    }

    if (user.interests) {
      user.interests = await Promise.all(user.interests.map(async (interestId) => {
        const interest = await Interests.findOne({ id: interestId });
        return interest ? interest.name : null;
      }));
    }
    const totalTablesCount = await Tables.count({ created_by: id });
    user.table_count = totalTablesCount;
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
