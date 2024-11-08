/**
 * @author mohan <mohan@studioq.co.in>
 */

/* global _, ProfileManagers /sails */

module.exports = async function update(request, response) {
    try {
        const { id, first_name, last_name, email, city, phone } = request.body;
        const updateData = { first_name, last_name, email, city ,phone };
        let _response_object = {};

        // Validate input attributes
        const input_attributes = [
            { name: 'id' },
            { name: 'first_name' },
            { name: 'last_name' },
            { name: 'email' },
            { name: 'city' },
        ];

        // Initialize validateModel function
        validateModel.validate(ProfileManagers, input_attributes, request.body, async function (valid, errors) {
            if (valid) {
                try {
                    // Update data of the ProfileManagers
                    const updatedTable = await ProfileManagers.updateOne({ id }).set(updateData);
                    
                    // If the table is not found, return an appropriate response
                    if (!updatedTable) {
                        return response.status(404).json({ error: 'Table not found' });
                    }

                    // Build and send response with updated details
                    _response_object.message = 'Table data has been updated successfully.';
                    return response.ok({ message: 'Table data updated successfully', details: updatedTable });
                } catch (error) {
                    console.error('Error updating table data:', error);
                    return response.status(500).json({ error: 'Error updating table data' });
                }
            } else {
                return response.status(400).json({ errors, count: errors.length });
            }
        });
    } catch (error) {
        console.error("Error occurred while updating ProfileManagers data:", error);
        response.status(500).json({ error: "Error occurred while updating ProfileManagers data" });
    }
};
