/**
 * Calculates the profile completion percentage based on user data.
 * @param {Object} userData - The user data object containing fields like age, gender, etc.
 * @returns {Promise<{ percentage: number, updatedProfile: object | null, missingFields: string[] }>} 
 *          - An object containing the profile completion percentage, updated profile, and missing fields.
 */
module.exports = async function (userData) {
    // Destructure the required fields from the userData object
    const { id: profileId, age, gender, first_name, photo, phone, about_me, facebook_data, interests, instagram_link, x_link, linkedin_link } = userData;

    // Check for social links
    const hasSocialLink = instagram_link || x_link || linkedin_link || facebook_data;
    const hasInterests = Array.isArray(interests) && interests.length > 0; // Handle interests properly

    // Define field weights (ignore empty strings and handle null/empty arrays)
    const fieldWeights = {
        first_name: first_name ? 10 : 0,
        age: age ? 10 : 0,
        gender: gender ? 10 : 0,
        about_me: about_me && about_me.trim() !== '' ? 10 : 0, // Exclude empty strings
        social_link: hasSocialLink ? 10 : 0,
        photo: photo ? 20 : 0,
        phone: phone ? 20 : 0,
        interests: hasInterests ? 10 : 0 // Handle interests null or empty array
    };

    // Calculate completion percentage
    let percentage = Object.values(fieldWeights).reduce((sum, weight) => sum + weight, 0);

    // Ensure the percentage does not exceed 100
    percentage = Math.min(percentage, 100);

    // Define the required fields for completeness check
    const requiredFields = {
        first_name,
        age,
        gender,
        about_me,
        social_link: hasSocialLink,
        photo,
        phone,
        interests // Checking interests directly
    };

    const missingFields = [];

    // Check for missing fields
    for (const [field, value] of Object.entries(requiredFields)) {
        if (value === undefined || value === null || value === false || value === '' || (Array.isArray(value) && value.length === 0)) {
            missingFields.push(field);
        }
    }

    // Update the profile completion status in the database
    let updatedProfile = null;
    if (percentage > 0) {
        updatedProfile = await ProfileMembers.updateOne({ id: profileId }).set({ profile_completion_status: [percentage] }); // Set percentage directly
    }

    // Log the completion percentage and missing fields

    if (updatedProfile?.photo) {
        updatedProfile.photo = sails.config.custom.s3_bucket_options.profile_photo + updatedProfile.photo;
    }

    if (updatedProfile?.phone) {
        updatedProfile.phone = await UseDataService.phoneCrypto.decryptPhone(updatedProfile.phone)
    }

    // Return the result including the percentage, updated profile, and missing fields
    return { percentage, updatedProfile, missingFields };
};
