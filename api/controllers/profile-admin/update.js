
/**
 *
 * @author mohan <mohan@studioq.co.in>
 *
 */

/* global _, Users /sails */
module.exports = async function update(request, response) {
    try {
        const postRequestData = request.body;
        const { id, interests, instagram_id, instagram_data } = postRequestData;
        
        // Construct update data including interests, instagram_id, and instagram_data
        const updateData = { interests, instagram_id, instagram_data };

        const inputAttributes = [
            { name: 'id', required: true },
            { name: 'interests', type: Array },
            { name: 'instagram_id'},
            { name: 'instagram_data'},
        ];

        // Validate input attributes
        validateModel.validate(Users, inputAttributes, postRequestData, async function (valid, errors) {
            if (valid) {
                try {
                    // Check if the user exists
                    const user = await Users.findOne({ id });
                    if (!user) {
                        return response.notFound({ message: 'User not found' });
                    }


                    // Update user record with new data
                    await Users.update({ id }, { ...updateData });

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
