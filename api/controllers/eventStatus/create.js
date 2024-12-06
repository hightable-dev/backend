/**
 * @author mohan <mohan@studioq.co.in>
 */

/* global _, ProfileManagers /sails */

module.exports = function createEventStatus(request, response) {
    try {
        const post_request_data = request.body;

        // Validate the model
        const input_attributes = [
            { name: 'table_id', required: true },
            { name: 'user_id', required: true },
        ];
        
        const _response_object = {};
        post_request_data.creator_id = ProfileMemberId(request);

        validateModel.validate(EventStatus, input_attributes, post_request_data, async function (valid, errors) {
            if (valid) {

                // Create data in StandardTable
                const eventDone = await EventStatus.create(post_request_data);

                // Respond with success message
                return response.ok({ message: 'Event completed by creator.', eventDone: eventDone });
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
