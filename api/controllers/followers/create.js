/* global _, ProfileManagers /sails */
module.exports = async function (request, response) {
    let keysToPick, filtered_post_data, input_attributes;
    const post_request_data = request.body;
    const { creator_profile_id } = post_request_data;
    const { active, follower } = UseDataService;

    input_attributes = [
        { name: 'creator_profile_id', required: true }
    ];

    const isFollowed = await Followers.findOne({ follower_profile_id: ProfileMemberId(request), creator_profile_id });

    const userDetails = await ProfileMembers.findOne({ id: ProfileMemberId(request) });

    if (!isFollowed) {
        input_attributes.push(
            { name: 'status', required: true },
            { name: 'follower_profile_id', required: true }
        )
    };

    async function insertFilteredPostData() {
        keysToPick = input_attributes.map(attr => attr.name);
        filtered_post_data = _.pick(post_request_data, keysToPick);
        console.log({ post_request_data });

        if (!isFollowed) {
            filtered_post_data.follower_profile_id = ProfileMemberId(request)
            filtered_post_data.status = 14 // set status initially to 14
        } else {
            const updatedData = { ...isFollowed };

            if (isFollowed.status === active) {
                updatedData.status = follower; // Update status to 14 if it's currently 1
            } else if (isFollowed.status === follower) {
                updatedData.status = active; // Update status to 1 if it's currently 14
            }

            const updateItems = await Followers.updateOne({ id: isFollowed.id }).set({ ...updatedData });
            console.log({ updateItems })
            const followMsg = 'User followed'
            const unFollowMsg = 'User UnFollowed'

            return response.status(200).json({ message: updateItems.status === 14 ? followMsg : unFollowMsg, details: updateItems });
        }
    };

    try {
        await insertFilteredPostData();
        UseDataService.dataCreate(
            request,
            response,
            {
                modelName: Followers,
                inputAttributes: input_attributes,
                filteredPostData: filtered_post_data,
                path: SwaggerGenService.getRelativePath(__filename)
            },
        );
    } catch (error) {
        return response.status(500).json({ error: error.message });
    } finally {
        try {
            await UseDataService.countFollowers(creator_profile_id);
            if (!isFollowed) {
                await UseDataService.sendNotification({
                    notification: {
                        senderId: ProfileMemberId(request),
                        type: 'follow',
                        message: `${userDetails?.first_name} subscribed for your table updates.`,
                        followUser: creator_profile_id,
                        tableId: null,
                        payOrderId: '',
                        isPaid: false,
                        templateId: 'follower',
                        roomName: 'Follow_',
                        creatorId: creator_profile_id,
                        status: 1,
                    },
                    pushMessage: {
                        title: 'High Table',
                    }
                });
            }
        } catch (finalError) {
            sails.log.error('Error in finally block:', finalError);
        }
    };
};