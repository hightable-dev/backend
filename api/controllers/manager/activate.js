/**
 * @author mohan <mohan@studioq.co.in>
 */

/* global _, ProfileManagers /sails */
module.exports =  function update(request, response) {
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
        validateModel.validate(ProfileManagers, inputAttributes, postRequestData, async function (valid, errors) {
            if (valid) {
                try {
                    // Check if the user exists
                    const user = await ProfileManagers.findOne({ id });
                    if (!user) {
                        return response.badRequest({ message: 'User not found' });
                    }
                    // Toggle status between 0 and 1
                    updateData.status = user.status === active ? inActive : active;
                    const isActive = user.status === active ? 'false' : 'true';
                    const msg = user.status === active ? 'Deactivated' : 'Activated';

                    // Update user record with new data
                    await ProfileManagers.update({ id }, { status: updateData.status });

                    // Build and send response
                    return response.ok({ message: `Manager ${msg}`, is_active: isActive });
                } catch (error) {
                    return response.serverError(error);
                }
            } else {
                return response.badRequest({ errors, count: errors.length });
            }
        });
    } catch (error) {
        return response.serverError(error);
    }
};
