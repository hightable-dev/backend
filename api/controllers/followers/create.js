/**
 * @author mohan <mohan@studioq.co.in>
 */


/* global _, ProfileManagers /sails */

module.exports = function (request, response) {
    const userDetails = request.user
    const setStatus = sails.config.custom.statusCode.active; //set default value
    const followerStatus = sails.config.custom.tableStatusCode.follower; // change status for bookmark 13

    const post_request_data = request.body;
    const { creator_profile_id: creatorId } = post_request_data;

    let _response_object = {};
    const filtered_post_data = _.pick(post_request_data, ['status', 'follower_profile_id', 'creator_profile_id']);

    const input_attributes = [
        { name: 'follower_profile_id' },
        { name: 'creator_profile_id' },
        { name: 'status' }
    ];

    const sendResponse = (message, details) => {
        _response_object = { message };
        if (details) _response_object.details = details;
        response.ok(_response_object);
    };

    validateModel.validate(Followers, input_attributes, filtered_post_data, async function (valid, errors) {
        if (valid) {
            try {
                const items = await Followers.findOne({ follower_profile_id: ProfileMemberId(request), creator_profile_id: creatorId });

                if (!items) {
                    // Followers does not exist, create new
                    const dataToCreate = {
                        creator_profile_id: filtered_post_data.creator_profile_id,
                        follower_profile_id: ProfileMemberId(request),
                        status: followerStatus // set status initially to 14
                    };
                    const newData = await Followers.create(dataToCreate);

                    if (newData) {
                        await UseDataService.sendNotification({
                            notification: {
                                senderId: ProfileMemberId(request),
                                type: 'follow',
                                message: `${userDetails?.first_name} subscribed for your table updates.`,
                                followUser: filtered_post_data?.creator_profile_id,
                                tableId: null,
                                payOrderId: '',
                                isPaid: false,
                                templateId: 'follower',
                                roomName: 'Follow_',
                                creatorId: filtered_post_data?.creator_profile_id,
                                status: 1,
                            },
                            pushMessage: {
                                title: 'High Table',
                            }
                        });
                    }
                } else {
                    // Followers exists, update
                    const updatedData = { ...items };
                    const updateStatusCode = parseInt(items.status);

                    if (updateStatusCode === setStatus) {
                        updatedData.status = followerStatus; // Update status to 14 if it's currently 1
                    } else if (updateStatusCode === followerStatus) {
                        updatedData.status = setStatus; // Update status to 1 if it's currently 14
                    }

                    const updateItems = await Followers.updateOne({ id: items.id }, updatedData);
                    sendResponse('Followers updated.', updateItems);
                }

                await UseDataService.countFollowers(creatorId);

            } catch (error) {
                console.error('Error creating or updating Followers:', error);
                _response_object = { error };
                return response.serverError(_response_object);
            }

        } else {
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.serverError(_response_object);
        }
    });
};
