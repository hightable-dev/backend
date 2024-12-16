module.exports = async function (request, response) {
    let keysToPick, filtered_post_data, input_attributes, payload_attributes, wishlistMessage;
    const { bookmarkTable, active } = UseDataService;
    const post_request_data = request.body;
    const { table_id: tableId } = post_request_data;

    let newData = null;

    input_attributes = [
        { name: 'table_id', required: true },
    ];

    payload_attributes = [
        ...input_attributes,
        { name: 'user_id', required: true },
        { name: 'creator_profile_id', required: true },
        { name: 'status', required: true },
    ];

    if (!tableId) {
        return response.status(400).json({ message: 'Table ID is required.' });
    }

    if (tableId) {
        /* Check if the table is created by the user */
        const isCheckdata = await UseDataService.checkTableCreatedByCurrentUser({
            tableId,
            userId: ProfileMemberId(request),
        });

        const checkWishListExist = await UseDataService.toggleWishListItem({
            tableId,
            userId: ProfileMemberId(request),
        });

        if (checkWishListExist) {
            if (checkWishListExist?.status === bookmarkTable) {
                wishlistMessage = 'Bookmark removed.';
                checkWishListExist.status = active;
            } else {
                wishlistMessage = 'Bookmark Added.';
                checkWishListExist.status = bookmarkTable;
            }

            const toggleWishlist = await BookMarks.updateOne(
                { id: checkWishListExist.id },
                checkWishListExist
            );
            await UseDataService.countTablesWishlist(tableId);

            return response
                .status(200)
                .json({ message: wishlistMessage, details: toggleWishlist });
        }

        if (isCheckdata) {
            if (!response.headersSent) {
                return response
                    .status(500)
                    .json({ message: 'You cannot add to wishlist for your table.' });
            }
        }
    }

    // Filter data function
    async function insertFilteredPostData() {
        keysToPick = payload_attributes.map((attr) => attr.name);
        filtered_post_data = _.pick(post_request_data, keysToPick);
        filtered_post_data.status = bookmarkTable;
        filtered_post_data.user_id = ProfileMemberId(request);
        try {
            const tableDetails = await Tables.findOne({ id: tableId }).select(['created_by']);
            filtered_post_data.creator_profile_id = tableDetails.created_by;

        } catch {
            throw ({ status: 400, message: 'No table found.' });
        }



        return filtered_post_data;
    }

    try {
        // Prepare data
        await insertFilteredPostData();

        newData = await UseDataService.dataCreate(request, response, {
            modelName: BookMarks,
            inputAttributes: input_attributes,
            payloadData: payload_attributes,
            postData: filtered_post_data,
            path: SwaggerGenService.getRelativePath(__filename),
        });
    } catch (error) {
        // Handle errors
        if (!response.headersSent) {
            return response
                .status(error.status || 500)
                .json({ message: error.message || 'Internal Server Error' });
        }
    } finally {
        // Log in finally block
        await UseDataService.countTablesWishlist(tableId);
    }
};
