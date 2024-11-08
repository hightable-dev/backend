/**
 * @author mohan <mohan@studioq.co.in>
 */

/* global _, ProfileManagers /sails */

module.exports = async function update(request, response) {
    try {
        const { id, name } = request.body;
        let _response_object = {};

        // Validate input attributes
        const input_attributes = [
            { name: 'id', number: true, min: 1 },
            { name: 'name' }
        ];

        // Initialize validateModel function
        const validateModel = new Promise((resolve, reject) => {
            validateModel.validate(null, input_attributes, { id, name }, async function (valid, errors) {
                if (valid) {
                    resolve();
                } else {
                    reject(errors);
                }
            });
        });

        await validateModel;

        // Update name of the interests
        await Interests.updateOne({ id }).set({ name });

        _response_object.message = 'Interest name has been updated successfully.';
        response.ok(_response_object);
    } catch (error) {
        console.error("Error occurred while updating interests name:", error);
        response.status(500).json({ error: "Error occurred while updating interests name" });
    }
};
