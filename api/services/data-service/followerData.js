
module.exports = async function (data) {
    const { followerId, userId } = data ;

    // Define required fields and their corresponding types
    const requiredFields = {
        followerId: 'number',
        userId: 'number',
    };

    // Collect missing fields dynamically
    const missingFields = Object.keys(requiredFields).filter(field => {
        // Check for missing fields or wrong data types
        return !data[field] || typeof data[field] !== requiredFields[field];
    });

    // If any fields are missing or have wrong data types, throw an error with the dynamic message
    if (missingFields.length > 0) {
        throw new Error(`Missing or invalid fields: ${missingFields.join(', ')}`);
    }

    try {
        const data = await Followers.findOne({
          follower_profile_id: userId,
          creator_profile_id: followerId,
          status : 14
        });
        return data ? true : false; // Return bookings if found, otherwise null
    } catch (error) {
        throw new Error("Error fetching bookings: " + error.message);
    }
};
