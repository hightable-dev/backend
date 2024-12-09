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
        
        post_request_data.creator_id = ProfileMemberId(request);

        validateModel.validate(EventStatus, input_attributes, post_request_data, async function (valid, errors) {
            if (valid) {

                // Create data in StandardTable
                const eventDone = await EventStatus.create(post_request_data);

                // Respond with success message
                return response.ok({ message: 'Event completed by creator.', eventDone: eventDone });
            } else {
                 throw ( errors);         
            }
        });
    } catch (error) {
      throw ("An error occurred while creating data.");
    }
};
