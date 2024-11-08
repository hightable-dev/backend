
module.exports = async function findOne(request, response) {
    const logged_in_user = request.user.profile_members;
    const request_query = request.allParams();
    var _response_object = {};
    const { page, limit } = request.body;
    const pageNumber = parseInt(page) || 1; 1
    const limitNumber = parseInt(limit) || 10;
    const filtered_post_data = _.pick(request_query, ['page', 'limit']);
    var input_attributes = [
        { name: 'page', number: true, min: 1 },
        { name: 'limit', number: true, min: 1 },
    ];

    function sendResponse(details) {
        _response_object['message'] = 'Notification Retrieved successfully.';
        _response_object['items'] = _.cloneDeep(details);
        return response.ok(_response_object);
    }

    validateModel.validate(Notifications, filtered_post_data, input_attributes, async function (user, errors) {
        try {
            const notication = await Notifications.find({ receiver: logged_in_user })
                .skip((pageNumber - 1) * limitNumber) 
                .limit(limitNumber).sort("created_at DESC");

            await Promise.all(notication.map(async (receiverData) => {

                if (receiverData.follow_user) {
                    let profileData = await ProfileMembers.findOne(receiverData.follow_user);
                    receiverData.follow_user = profileData;
                }

                if (receiverData.table_id) {
                    let tableData = await Tables.findOne({ id: parseInt(receiverData.table_id) });
                    receiverData.table_id = tableData;
                }

            }));


            if (notication && notication.length > 0) {
                return sendResponse(notication);
            } else {
                // Assuming errorBuilder.build is an async function, await it
                const error_obj = 'No Notification'
                _response_object.errors = error_obj;
                _response_object.count = error_obj.length;
                return response.status(500).json(_response_object);
            }
        } catch (error) {
            // Handle any errors that occur during the process
            return response.status(500).json({ error: "Internal Server Error" });
        }
    });
}