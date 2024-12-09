
module.exports = function status(request, response) {
    const profileId = request.user.profile_members;
    const post_request_data = request.body;
    let request_query = request.allParams();
    var _response_object = {};
    var input_attributes = [
        { name: 'id', required: true, number: true, min: 1 },
        { name: 'read', required: true },
    ];
    pick_input = [
        'id', 'read',
    ];

    request_query = _.pick(request_query, ['id']);
    var filtered_post_data = _.pick({ ...post_request_data, ...request_query }, pick_input);
    // Update the UserProfilesType record to db.
    function updateNotification(id, data, callback) {
        Notifications.update(id, data, function (err, userprofile) {
            UtilsService.throwIfErrorElseCallback(err, response, 400, () => {
                callback(userprofile[0]);
            });
        });
    };

    // Check whether the User id is exits in db.
    function isUsersExist(id, callback) {
        Notifications.findOne(
            {
                id,
            },
            function (err, userprofile) {
                UtilsService.throwIfErrorElseCallback(err, response, 400, () => {
                    if (!userprofile) {
                        _response_object.message = 'No userprofile found with the given id.';
                        return response.notFound(_response_object);
                    } else {
                        callback(userprofile);
                    }
                });
            });
    }

    // Build and send response.
    function sendResponse(details) {

        _response_object.details = _.pick(details, 'status');
        _response_object.message = 'Notification Status Updated successfully';
        _response_object.details = details;
        return response.ok(_response_object);
    };

    validateModel.validate(null, input_attributes, filtered_post_data, function (valid, errors) {
        if (valid) {
            isUsersExist(filtered_post_data.id, function () {
                updateNotification(filtered_post_data.id, _.omit(filtered_post_data, ['id']), function (notification) {
                    var roomName = 'Review_' + profileId;
                    notification.user = profileId
                    socketService.notification(roomName, notification);
                    sendResponse(notification);
                });
            });
        } else {
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.badRequest(_response_object);
        }
    });
};