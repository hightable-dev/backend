const _ = require('lodash');

module.exports = function reviews(request, response) {
    const profileId = request.user.profile_members;
    const post_request_data = request.body;
    const filtered_post_data = _.pick(post_request_data, ['reviewer_profile_id', 'creator_profile_id', 'table_id', 'reviews', 'comments']);
    const input_attributes = [
        { name: 'creator_profile_id' },
        { name: 'table_id' },
        { name: 'reviews' },
        { name: 'comments' },
    ];
    // hightable_reviews_id_seq
    const createOrUpdateReviews = async () => {
        try {
            // Check if the table_id exists in the Tables model
            const table = await Tables.findOne({ id: filtered_post_data.table_id });
            if (!table) {
                return response.notFound({ message: "Table not found." });
            }

            // Check if the table is active (status !== 0)
            if (table.status === 0) {
                return response.badRequest({ message: "Table is not active." });
            }

            // Get the creator_profile_id from the Tables model where id matches table_id
            const creatorProfileId = await Tables.findOne({ id: filtered_post_data.table_id }).select(['created_by']);
            if (!creatorProfileId) {
                return response.notFound({ message: "Creator profile ID not found." });
            }
            filtered_post_data.creator_profile_id = creatorProfileId.created_by;
            filtered_post_data.reviewer_profile_id = profileId;

            // Check if the review already exists for the reviewer_profile_id and table_id combination
            const existingReviews = await Reviews.findOne({ reviewer_profile_id: filtered_post_data.reviewer_profile_id, table_id: filtered_post_data.table_id });
            if (existingReviews) {
                return response.badRequest({ message: "Rating already submitted. Cannot update or create." });
            }

            // Create new reviews
            const newReviews = await Reviews.create(filtered_post_data);
            const tableDetails = await Tables.findOne({ id: filtered_post_data.table_id })
            if (newReviews) {

                await UseDataService.sendNotification({
                    notification: {
                        senderId: profileId,
                        type: 'Review',
                        message: `Please confirm status for the table '${tableDetails?.title}'.`,
                        receiverId: filtered_post_data?.creator_profile_id,
                        followUser: null,
                        tableId: newReviews?.table_id,
                        payOrderId: '',
                        isPaid: true,
                        templateId: 'review',
                        roomName: 'Review_',
                        creatorId: null,
                        status: 1,
                    },
                    pushMessage: {
                        title: 'Review',
                    }
                });
            }
            // Update reviews count
            await updateReviewsCount(newReviews);
            response.ok({ message: "Reviews created successfully.", reviews: newReviews });
            // process.nextTick(() => {
            //     const relativePath = SwaggerGenService.getRelativePath(__filename);
            //     UseDataService.processSwaggerGeneration({ relativePath, inputAttributes: input_attributes, responseObject: newReviews });

            // });

            process.nextTick(() => {
                const relativePath = SwaggerGenService.getRelativePath(__filename);
                const capitalizeFirstLetter = (str) => {
                    if (typeof str !== "string" || str.length === 0) return str;
                    return str.charAt(0).toUpperCase() + str.slice(1);
                };
                SwaggerGenService.generateJsonFile({
                    key: `/${relativePath}`,
                    Tags: capitalizeFirstLetter(relativePath.split("/")[0]),
                    Description: `Create a table ${capitalizeFirstLetter(
                        relativePath.split("/")[0]
                    )} - ${relativePath.split("/")[1]}`,
                    body: {},
                    required_data: input_attributes,
                    response: newReviews,
                });
            });

            return
        } catch (err) {
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
            await ProfileMembers.updateOne({ id: parseInt(newReviews.creator_profile_id) }).set({ reviews: avgCreatorReview, reviews_count: tableReviewsCount });
            // await CreatorReviews.updateOrCreate({ creator_profile_id: newReviews.creator_profile_id }, { creator_profile_id: newReviews.
        } catch (err) {
            throw new Error ('Error updating reviews count:', err);
        }
    };

    validateModel.validate(Reviews, input_attributes, filtered_post_data, async (valid, errors) => {
        if (!valid) {
            return response.badRequest({ errors, count: errors.length });
        }
        await createOrUpdateReviews();
    });
};
