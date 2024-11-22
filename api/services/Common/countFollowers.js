/**
 * Updates the follower count for a given creator in the database.
 * 
 * This function counts the number of followers for a specified creator based on 
 * the provided status and updates the creator's profile with the new follower count.
 *
 * @async
 * @function updateCount
 * @param {string|number} creatorId - The ID of the creator whose follower count is to be updated.
 * @returns {Promise<void>} - A promise that resolves when the follower count has been updated.
 * @throws {Error} - Throws an error if there is an issue counting followers or updating the profile.
 */


module.exports = async function (creatorId) {
    
const { followerUsers } = UseDataService; // Importing follower status from a data service

    console.log("Follower count", { followerUsers, creatorId });

    try {
        // Count the total number of followers for the creator based on the status
        const totalCount = await Followers.count({ creator_profile_id: creatorId, status: followerUsers });

        // Update the profile of the creator with the new follower count
        await ProfileMembers.updateOne({ id: creatorId }, { followers: totalCount });

    } catch (error) {
        console.error('Error updating Followers count:', error);
        throw error; // Optional: Re-throw the error if you want it to propagate
    }
}
