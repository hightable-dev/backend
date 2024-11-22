/**
 * @author mohan <mohan@studioq.co.in>
 */

/* global _, ProfileManagers /sails */

module.exports = async function findOne(request, response) {

  try {
    let _response_object = {
       ...sails.config.custom.s3_bucket_options
    };


    let specificUsers = await ProfileMembers.findOne({ id: ProfileMemberId(request) }).omit(['account_details']);

    // Check if user exists
    if (!specificUsers) {
      return response.status(400).json({ error: 'User not found' }); // Customize error message here
    }

    const getPercentileData = await UseDataService.profilePercentile(specificUsers);

    if (getPercentileData > 100) {
      return response.status(400).json({ error: `Profile completion percentage cannot exceed 100. Calculated percentage: ${getPercentileData}` });
    }

    if (specificUsers?.interests) {
      specificUsers.interests_list = await Promise.all(specificUsers.interests.map(async (interestId) => {
        const interest = await Interests.findOne({ id: interestId });
        return interest ? interest.name : null;
      }));
    }

    _response_object = {
      message: 'User retrieved successfully.',
      ...sails.config.custom.s3_bucket_options,
      
      data: getPercentileData.updatedProfile, // Use the retrieved user

    }

    return response.ok(_response_object);
  } catch (error) {
    console.error("Error occurred while fetching user:", error);
    return response.status(500).json({ error: "Error occurred while fetching user" });
  }
}
