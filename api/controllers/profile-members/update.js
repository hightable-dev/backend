
/**
 *
 * @author mohan <mohan@studioq.co.in>
 *
 */

module.exports = function update(request, response) {
    const profileId = request.user.profile_members;

    try {
        const postRequestData = request.body;
        const { first_name, last_name, interests, instagram_id, instagram_data, phone, description, email, about_me, pronoun, linkedin_link, instagram_link, age, gender, facebook_data, linkedin_data, x_data, x_link } = postRequestData;

        // Construct update data including interests, instagram_id, and instagram_data
        const updateData = { first_name, last_name, interests, instagram_id, instagram_data, description, email, about_me, pronoun, linkedin_link, instagram_link, age, gender, facebook_data, linkedin_data, x_data, x_link };

        const inputAttributes = [
            { name: 'first_name' },
            { name: 'last_name' },
            { name: 'interests', type: Array },
            { name: 'instagram_id' },
            { name: 'phone' },
            { name: 'description' },
            { name: 'email' },
            { name: 'about_me' },
            { name: 'pronoun' },
            { name: 'linkedin_link' },
            { name: 'instagram_link' },
            { name: 'facebook_data' },
            { name: 'linkedin_data' },
            { name: 'instagram_data' },
            { name: 'x_data' },
            { name: 'x_link' },
            { name: 'age' },
            { name: 'gender' },
        ];

        // Validate input attributes
        validateModel.validate(ProfileMembers, inputAttributes, postRequestData, async function (valid, errors) {
            if (valid) {
                try {
                    // Check if the profile member exists
                    const profileMember = await ProfileMembers.findOne({ id: profileId });
                    if (!profileMember) {
                        return response.notFound({ message: 'Profile member not found' });
                    }

                    // Encrypt the phone number before updating
                    if (phone && phone.trim() !== '' ) {
                      
                        updateData.phone = UseDataService.phoneCrypto.encryptPhone(phone);
                    }

                    // Update profile member record with new data
                    const updatedUser = await ProfileMembers.updateOne({ id: profileId }).set(updateData);
                    console.log({updatedUser})

                    const getPercentileData = await UseDataService.profilePercentile(updatedUser);

                    if (getPercentileData > 100) {
                        return response.serverError({ error: `Profile completion percentage cannot exceed 100. Calculated percentage: ${getPercentileData}` });
                    }

                    return response.ok({ message: 'Profile member data updated successfully', data: getPercentileData.updatedProfile });
                } catch (error) {
                    return response.serverError(error);
                }
            } else {
                return response.badRequest({ errors, count: errors.length });
            }
        });
    } catch (error) {
        return response.serverError(error);
    } finally {
        

    }
};
