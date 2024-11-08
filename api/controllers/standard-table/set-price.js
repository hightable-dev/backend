/**
 * @author mohan <mohan@studioq.co.in>
 */

/* global _, ProfileManagers /sails */

module.exports = async function create(request, response) {
    try {
        const post_request_data = request.body;
        const { price } = post_request_data;

        // Check if all required fields are present
        // if (!table_type || !price || !admin_id || !admin_type) {
        //     return response.status(400).json({ error: "Missing required fields." });
        // }

        // Validate the model
        const input_attributes = [
            { name: 'price', required: true },
        ];

        
        const _response_object = {};
        post_request_data.table_type = tableType.standard;
        post_request_data.admin_id = ProfileAdminId(request);
        post_request_data.admin_type = UserType(request);
        post_request_data.last_checkin_via = 'web';

        validateModel.validate(StandardTable, input_attributes, post_request_data, async function (valid, errors) {
            if (valid) {
                // Find the last created data in StandardTable
                const lastEntry = await StandardTable.find().sort([{ created_at: 'DESC' }]);

                // Check if there's a last entry
                if (lastEntry.length > 0) {
                    // Compare the last entry's table_type and price with the new data
                    if (lastEntry[0].table_type === tableType.standard && lastEntry[0].price === price) {
                        return response.status(400).json({ message: "Previous data has the same price and table type." });
                    }
                }

                // Create data in StandardTable
                const user = await StandardTable.create(post_request_data);

                // Respond with success message
                return response.ok({ message: 'Data created successfully.', user: user });
            } else {
                _response_object.errors = errors;
                _response_object.count = errors.length;
                return response.status(400).json(_response_object);
            }
        });
    } catch (error) {
        console.error(error);
        return response.status(500).json({ error: "An error occurred while creating data." });
    }
};
