/**
 * @author mohan <mohan@studioq.co.in>
 */

/* global _, ProfileManagers /sails */

module.exports = async function findOne(request, response) {
  const profileId = request.user.profile_members;

  try {
    var _response_object = {};

    // Extract ID from request parameters
    const { id } = request.query;
    const filterData = ['payment_details','facebook_data', 'created_at', 'updated_at']; // Specify fields to filter

    // Find user by ID
    // const specificUsers = await Users.find({ id }).limit(1); // Use .find().limit(1) instead of findOne()
    // const specificUsers = await ProfileMembers.find({ id:profileId }).limit(1); // Use .find().limit(1) instead of findOne()
    const specificUsers = await ProfileMembers.find({ id:ProfileMemberId(request)}).limit(1); // Use .find().limit(1) instead of findOne()

    // Check if user exists
    if (!specificUsers || specificUsers.length === 0) {
      return response.status(400).json({ error: 'User not found' }); // Customize error message here
    }
    let filteredItems = specificUsers ;
    filteredItems = common.filterDataItems(filteredItems, filterData);

    const user = specificUsers[0]; // Retrieve the first user from the result
    if(user.photo){
      user.photo = sails.config.custom.filePath.members + user.photo;

    }
    if (user.phone) {
      await phoneEncryptor.decrypt(user.phone, function (decrypted_text) {
        user.phone = decrypted_text;
      });
    }

    if (user.interests) {
      user.interests_list = await Promise.all(user.interests.map(async (interestId) => {
          const interest = await Interests.findOne({ id: interestId });
          return interest ? interest.name : null;
      }));
      // delete user.interests; // Remove the old property
  }
  


    const totalTablesCount = await Tables.count({ created_by: profileId });
      // _response_object.table_count = totalTablesCount; // requested by frontend
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
