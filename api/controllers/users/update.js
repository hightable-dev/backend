/**
 *
 * @author mohan <mohan@studioq.co.in>
 *
 */

/* global _, Users /sails */
module.exports = async function update(request, response) {

    const logged_in_user = request.user;


    try {
        const postRequestData = request.body;
        const { interests, about_me, instagram_id, instagram_data, onesignal_player_ids } = postRequestData;

        // Construct update data including interests, instagram_id, and instagram_data
        const updateData = { interests, about_me, instagram_id, instagram_data, onesignal_player_ids };

        const inputAttributes = [
            { name: 'interests', type: Array },
            { name: 'instagram_id' },
            { name: 'instagram_data' },
            { name: 'about_me' },
            { name: 'onesignal_player_ids' },
        ];

        // Validate input attributes
        validateModel.validate(Users, inputAttributes, postRequestData, async function (valid, errors) {
            if (valid) {
                try {
                    // Check if the user exists
                    const user = await Users.findOne({ id: logged_in_user?.id });
                    if (!user) {
                        return response.notFound({ message: 'User not found' });
                    }


                    // Update user record with new data
                    await Users.update({ id: logged_in_user?.id }, { ...updateData });

                    // Build and send response
                    return response.ok({ message: 'User data updated successfully' });
                } catch (error) {
                    console.error('Error updating user:', error);
                    return response.serverError(error);
                }
            } else {
                return response.status(400).json({ errors, count: errors.length });
            }
        });
    } catch (error) {
        console.error('Error updating user:', error);
        return response.serverError(error);
    }
};
