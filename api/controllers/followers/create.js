/**
 * @author mohan <mohan@studioq.co.in>
 */

const NotificationService = require("../../services/notificationService");

/* global _, ProfileManagers /sails */

module.exports = async function (request, response) {
    const profileId = request.user.profile_members;

    const UserId = request.user

    // const logded_user = UserId(request)

    // const ModelPrimary1 = Followers;
    // const ModelSecond = ProfileMembers; // Changed from Tables to ProfileMembers
    const setStatus = sails.config.custom.statusCode.active; //set default value
    const followerStatus = sails.config.custom.tableStatusCode.follower; // change status for bookmark 13

    const post_request_data = request.body;
    const { follower_profile_id: followerId, creator_profile_id: creatorId } = post_request_data;

    let _response_object = {};
    const msg = "Followers";
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
                const items = await Followers.findOne({ follower_profile_id: profileId, creator_profile_id: creatorId });

                if (!items) {
                    // Followers does not exist, create new
                    const dataToCreate = {
                        creator_profile_id: filtered_post_data.creator_profile_id,
                        follower_profile_id: profileId,
                        status: followerStatus // set status initially to 14
                    };
                    const newData = await Followers.create(dataToCreate);

                    if (newData) {
                        await notificationService({
                            senderId: profileId,
                            type: 'follow',
                            message: `${UserId?.first_name} started following you.`,
                            receiverId: filtered_post_data?.creator_profile_id,
                            followUser: filtered_post_data?.creator_profile_id,
                            tableId: null,
                            payOrderId: '',
                            isPaid: false,
                            templateId: 'follower',
                            roomName: 'Follow_',
                            creatorId: filtered_post_data?.creator_profile_id,
                            pushMsgTitle: UserId?.first_name,    // Title, Name ...
                            pushMessage: `${UserId?.first_name} started following you.`
                        });
                        await sendResponse(`${msg} created successfully.`, newData);
                    }

                    await updateCount();
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
                    sendResponse(`${msg} updated.`, updateItems);
                    await updateCount();
                }
            } catch (error) {
                console.error(`Error creating or updating ${msg}:`, error);
                _response_object = { error };
                return response.serverError(_response_object);
            }

            async function updateCount() {
                try {
                    const updateId = parseInt(creatorId);

                    // Count followers where status === followerStatus and creator_profile_id === updateId
                    const totalCount = await Followers.count({ creator_profile_id: updateId, status: followerStatus });


                    // Update followers count for ProfileMembers
                    await ProfileMembers.updateOne({ id: updateId }, { followers: totalCount });

                } catch (error) {
                    console.error(`Error updating ${msg} count:`, error);
                }
            }
        } else {
            _response_object.errors = errors;
            _response_object.count = errors.length;
            return response.serverError(_response_object);
        }
    });
};
