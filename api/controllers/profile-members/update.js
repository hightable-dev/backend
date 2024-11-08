
/**
 *
 * @author mohan <mohan@studioq.co.in>
 *
 */

module.exports = async function update(request, response) {
    const profileId = request.user.profile_members;

    try {
        const postRequestData = request.body;
        const { interests, instagram_id, instagram_data, phone, description,email, about_me, pronoun,linkedin_link, instagram_link, age, gender } = postRequestData;

        // Construct update data including interests, instagram_id, and instagram_data
        const updateData = { interests, instagram_id, instagram_data, description ,email, about_me, pronoun, linkedin_link, instagram_link,age,gender };

        const inputAttributes = [
            { name: 'interests', type: Array },
            { name: 'instagram_id' },
            { name: 'phone' },
            { name: 'description' },
            { name: 'email' },
            { name: 'about_me' },
            { name: 'pronoun' },
            { name: 'linkedin_link' },
            { name: 'instagram_link' },
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
                    if (phone) {
                        await phoneEncryptor.encrypt(phone, function (encryptedPhone) {
                            updateData.phone = encryptedPhone;
                        });
                    }

                    // Update profile member record with new data
                    await ProfileMembers.updateOne({ id: profileId }).set(updateData);

                    // Fetch the updated profile member
                    const updatedProfileMember = await ProfileMembers.findOne({ id: profileId });

                    // Build and send response with updated details
                    return response.ok({ message: 'Profile member data updated successfully', data: updatedProfileMember });
                } catch (error) {
                    console.error('Error updating profile member:', error);
                    return response.serverError(error);
                }
            } else {
                return response.status(400).json({ errors, count: errors.length });
            }
        });
    } catch (error) {
        console.error('Error updating profile member:', error);
        return response.serverError(error);
    }
};
