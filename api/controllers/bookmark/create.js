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
        { name: 'status', required: true }
    ]
    if (tableId) {
        /* Check table created by user */
        const isCheckdata = await UseDataService.checkTableCreatedByCurrentUser({
            tableId,
            userId: ProfileMemberId(request)
        });

        const checkWishListExist = await UseDataService.toggleWishListItem({
            tableId,
            userId: ProfileMemberId(request)
        });

        if (checkWishListExist) {
            if (checkWishListExist?.status === bookmarkTable) {
                wishlistMessage = 'Bookmark removed.'
                checkWishListExist.status = active;
            } else {
                wishlistMessage = 'Bookmark Added.'
                checkWishListExist.status = bookmarkTable;
            }
            const toggleWihslist = await BookMarks.updateOne({ id: checkWishListExist.id }, checkWishListExist);
            await UseDataService.countTablesWishlist(tableId);

            return response.status(200).json({ message: wishlistMessage, details: toggleWihslist });
        };


        if (isCheckdata) {
            if (!response.headersSent) {
               throw ({ status:500, message:'You cannot add to wishlist for your table.'});

            }
        };
    };
    // Filter data function
    async function insertFilteredPostData() {
        keysToPick = payload_attributes.map((attr) => attr.name);
        filtered_post_data = _.pick(post_request_data, keysToPick);
        filtered_post_data.status = bookmarkTable;
        filtered_post_data.user_id = ProfileMemberId(request);
        filtered_post_data.creator_profile_id = ProfileMemberId(request);

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
           throw ( error);
        }

    } finally {
        // Log in finally block
        await UseDataService.countTablesWishlist(tableId);
        if (newData) {
            sails.log('await UseDataService.countTablesWishlist(tableId)', newData);

        }
    }
};
