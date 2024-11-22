/**
 * @author mohan <mohan@studioq.co.in>
 */

/* global _, ProfileMembers /sails */
module.exports = function update(request, response) {
    const active = sails.config.custom.statusCode.active;
    const inActive = sails.config.custom.statusCode.inactive;

    try {
        const postRequestData = request.body;
        const { id } = request.query;

        // Construct update data including interests, instagram_id, and instagram_data
        const updateData = {
            status: active // Default value for status
        };

        // Validate input attributes
        const inputAttributes = [
            { name: 'status' },
        ];

        // Validate input attributes
        validateModel.validate(ProfileMembers, inputAttributes, postRequestData, async function (valid, errors) {
            if (valid) {
                try {
                    // Check if the user exists
                    const user = await ProfileMembers.findOne({ id });
                    if (!user) {
                        return response.status(400).json({ message: 'User not found' });
                    }

                    // Toggle status between 0 and active
                    updateData.status = user.status === active ? inActive : active;
                    const isActive = user.status === active ? 'false' : 'true';
                    const msg = user.status === active ? 'Deactivated' : 'Activated';
                    // Update user record with new data
                    await ProfileMembers.update({ id }, { status: updateData.status });

                    // Build and send response
                    return response.ok({ message: `User ${msg} `, is_active: isActive });
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
