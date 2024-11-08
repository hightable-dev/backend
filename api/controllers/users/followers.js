module.exports = async function (request, response) {

    const ModelPrimary = FollowersUsers;
    const ModelSecond = Users;
    const setStatus = sails.config.custom.statusCode.active; //set default value
    // const followerUsersStatus = sails.config.custom.statusCode.followerUsers; // change status for bookmark 13
    const { pending, approved, reject, bookingClosed, cancelled, bookmarkTable, follower, followerUsers } = tableStatusCode;
    const followerUsersStatus = followerUsers;
    //sails.config.custom.statusCode.follower;
    const post_request_data = request.body;
    /*  user_id as currentUserId ,follower as followUserId  - Destructure post_request_data object to extract currentUserId and followUserId */
    const { user_id: currentUserId, follower_id: followUserId } = post_request_data;

    let _response_object = {};
    const msg = "Bookmarks";
    const filtered_post_data = _.pick(post_request_data, ['user_id', 'follower_id']);

    const input_attributes = [
        { name: 'user_id', required: true },
        { name: 'follower_id', required: true }
    ];

    /**
     * Send a response with a message and optional details.
     *
     * @param {any} message - the message to be sent
     * @param {any} details - optional details to be included in the response
     * @return {undefined} 
     */
    const sendResponse = (message, details) => {
        _response_object = { message };
        if (details) _response_object.details = details;
        response.ok(_response_object);
    };

    validateModel.validate(ModelPrimary, input_attributes, filtered_post_data, async function (valid, errors) {
        if (valid) {
            try {
                const items = await ModelPrimary.findOne({ user_id: currentUserId, follower_id: followUserId });

                if (!items) {
                    // ModelPrimary create new if does not exist any
                    const dataToCreate = {
                        user_id: currentUserId,
                        follower_id: followUserId,
                        status: followerUsersStatus // set status initially to 13
                    };
                    const newData = await ModelPrimary.create(dataToCreate);
                    sendResponse(`${msg} created successfully.`, newData);

                    await updateCount(); // Update bookmarks count for tables

                } else {
                    // ModelPrimary exists, update
                    const updatedData = { ...items };
                    // if status as string will convert to number
                    const updateStatusCode = parseInt(items.status);

                    if (updateStatusCode === setStatus) {
                        updatedData.status = followerUsersStatus; // Update status to followerUsersStatus if it's currently 1

                    } else if (updateStatusCode === followerUsersStatus) {
                        updatedData.status = setStatus; // Update status to 1 if it's currently followerUsersStatus
                    }

                    const updateItems = await ModelPrimary.updateOne({ id: items.id }, updatedData);
                    sendResponse(`${msg} updated .`, updateItems);
                    await updateCount(); // Update bookmarks count for tables
                }
            } catch (error) {
                console.error(`Error creating or updating ${msg}:`, error);
                _response_object = { error };
                return response.serverError(_response_object);
            }

            async function updateCount() {
                try {
                    //this used to conver id string to number
                    const updateId = parseInt(followUserId)

                    // Count follower where status === followerUsersStatus
                    const totalCount = await ModelPrimary.count({ follower: updateId, status: followerUsersStatus });

                    await ModelSecond.updateOne({ id: updateId }, { followers: totalCount });

                } catch (error) {
                    console.error(`Error updating ${msg} count:`, error);
                }
            }
        } else {
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.serverError(_response_object);
        }
    })
};