module.exports = async function findOne(request, response) {
    const logged_in_user = request.user.profile_members;
    const { page, limit } = request.query;  // Use query parameters instead of request body
    const pageNumber = parseInt(page) > 0 ? parseInt(page) : 1;
    const limitNumber = parseInt(limit) > 0 ? parseInt(limit) : 10;

    console.log(`Request received with page: ${pageNumber}, limit: ${limitNumber}`);

    function sendResponse(details, totalCount) {
        const _response_object = {
            message: 'Notification Retrieved successfully.',
            meta: {
                total: totalCount,
                page: pageNumber,
                limit: limitNumber,
            },
            items: details
        };
        console.log("Response object:", _response_object);
        return response.ok(_response_object);
    }

    try {
        // Calculate total count of notifications
        const totalCount = await Notifications.count({ receiver: logged_in_user });
        console.log(`Total notifications count for user: ${totalCount}`);

        // Fetch paginated notifications
        const notifications = await Notifications.find({ receiver: logged_in_user })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .sort("created_at DESC");

        console.log(`Notifications fetched: ${notifications.length}`);

        // Process each notification
        await Promise.all(notifications.map(async (receiverData) => {
            if (receiverData.follow_user) {
                let profileData = await ProfileMembers.findOne(receiverData.follow_user);
                receiverData.follow_user = profileData;
            }
            if (receiverData.table_id) {
                let tableData = await Tables.findOne({ id: parseInt(receiverData.table_id) });
                receiverData.table_id = tableData;
            }
        }));

        return sendResponse(notifications, totalCount);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return response.status(500).json({ error: "Internal Server Error", message: "Error fetching notifications" });
    }
};
