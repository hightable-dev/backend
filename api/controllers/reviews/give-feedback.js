module.exports = async function reviews(request, response) {
    const profileId = request.user.profile_members;
    const UserId = request.user
    const post_request_data = request.body;
    const filtered_post_data = _.pick(post_request_data, ['reviewer_profile_id', 'creator_profile_id', 'table_id', 'reviews', 'comments']);
    const input_attributes = [
        { name: 'creator_profile_id' },
        { name: 'table_id' },
        { name: 'reviews' },
        { name: 'comments' },
    ];

    const createOrUpdateReviews = async () => {
        try {
            // Check if the table_id exists in the Tables model
            const table = await Tables.findOne({ id: filtered_post_data.table_id });
            if (!table) {
                return response.status(404).json({ message: "Table not found." });
            }

            // Check if the table is active (status !== 0)
            if (table.status === 0) {
                return response.status(400).json({ message: "Table is not active." });
            }

            // Get the creator_profile_id from the Tables model where id matches table_id
            const creatorProfileId = await Tables.findOne({ id: filtered_post_data.table_id }).select(['created_by']);
            if (!creatorProfileId) {
                return response.status(404).json({ message: "Creator profile ID not found." });
            }
            filtered_post_data.creator_profile_id = creatorProfileId.created_by;
            filtered_post_data.reviewer_profile_id = profileId;

            // Check if the review already exists for the reviewer_profile_id and table_id combination
            const existingReviews = await Reviews.findOne({ reviewer_profile_id: filtered_post_data.reviewer_profile_id, table_id: filtered_post_data.table_id });
            if (existingReviews) {
                return response.status(400).json({ message: "Rating already submitted. Cannot update or create." });
            }

            // Create new reviews
            const newReviews = await Reviews.create(filtered_post_data).fetch();
            if (newReviews) {
                await NotificationService({
                    senderId: logged_in_user?.profile_members,
                    type: 'Review',
                    message: `Congratulations, You got a rating.`,
                    receiverId: filtered_post_data?.creator_profile_id,
                    followUser: null,
                    tableId: newReviews?.table_id,
                    payOrderId: '',
                    isPaid: false,
                    templateId: 'review',
                    roomName: 'Review_',
                    creatorId: null,
                    pushMsgTitle: `${UserId?.first_name} You got a new rating`,    // Title, Name ...
                    pushMessage: `New table found from '${logged_in_user?.first_name}'.`
                });

                // await Notifications.create(
                //     {

                //         sender: filtered_post_data?.reviewer_profile_id,
                //         type: "Review",
                //         message: `Review created`,
                //         table_id: newReviews?.table_id,
                //         receiver: filtered_post_data?.creator_profile_id,
                //     },
                //     async function (err, notification) {

                //         var roomName = 'Review_' + filtered_post_data?.creator_profile_id;
                //         newReviews.user = filtered_post_data?.creator_profile_id
                //         socketService.notification(roomName, newReviews);

                //         var push_data = {
                //             title: UserId?.first_name,
                //             message: `Congratulations! You got a new rating`,
                //             // player_ids: UserId?.onesignal_player_ids,
                //             player_ids:`user-${profileId}`,

                //         };

                //         push_data.data = {
                //             templateId: 'review',
                //             id: newReviews?.table_id,
                //             review: 5
                //         };
                //         await pushService.sendPush(push_data,function (data,error){

                //         })
                //     }
                // );
            }


            // Update reviews count
            await updateReviewsCount(newReviews);

            return response.ok({ message: "Reviews created successfully.", reviews: newReviews });
        } catch (err) {
            console.error('Error creating Reviews:', err);
            return response.serverError(err);
        }
    };

    const updateReviewsCount = async (newReviews) => {
        try {
            // Update total reviews by table_id
            const tableReviews = await Reviews.sum('reviews').where({ table_id: newReviews.table_id });
            const tableReviewsCount = await Reviews.count().where({ table_id: newReviews.table_id });
            const avgTableReview = parseFloat((tableReviews / tableReviewsCount).toFixed(2));


            // Update total reviews by creator_profile_id
            const creatorReviews = await Reviews.sum('reviews').where({ creator_profile_id: newReviews.creator_profile_id });
            const creatorReviewsCount = await Reviews.count().where({ creator_profile_id: newReviews.creator_profile_id });
            const avgCreatorReview = parseFloat((creatorReviews / creatorReviewsCount).toFixed(2));

            await Tables.updateOne({ id: parseInt(newReviews.table_id) }).set({ reviews: avgTableReview });

            // Update avgCreatorReview in ProfileMembers where id === creator_profile_id
            await ProfileMembers.updateOne({ id: parseInt(newReviews.creator_profile_id) }).set({ reviews: avgCreatorReview });

            // await CreatorReviews.updateOrCreate({ creator_profile_id: newReviews.creator_profile_id }, { creator_profile_id: newReviews.
        } catch (err) {
            console.error('Error updating reviews count:', err);
        }
    };

    validateModel.validate(Reviews, input_attributes, filtered_post_data, async (valid, errors) => {
        if (!valid) {
            return response.status(400).json({ errors, count: errors.length });
        }
        await createOrUpdateReviews();
    });
};
