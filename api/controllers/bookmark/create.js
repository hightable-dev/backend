/**
 * @author mohan <mohan@studioq.co.in>
 */

/* global _, ProfileManagers /sails */

module.exports = async function (request, response) {
    // const profileId = request.user.profile_members;
    const { pending, approved, rejected, bookingClosed, bookmarkTable } = tableStatusCode;

    const ModelPrimary = Bookmarks;
    const ModelSecond = Tables;
    const setStatus = sails.config.custom.statusCode.active; //set default value
    // const bookmarkTableddff = sails.config.custom.statusCode.bookmark; // change status for bookmark 13
    //sails.config.custom.statusCode.follower;
    const post_request_data = request.body;
    /*  user_id as userId ,table_id as tableId   */
    const { user_id: userId, table_id: tableId } = post_request_data;

    let _response_object = {};
    const msg = "Bookmarks";
    const filtered_post_data = _.pick(post_request_data, ['user_id', 'table_id']);

    // Destructure post_request_data object to extract userId and tableId

    const input_attributes = [
        { name: 'user_id' },
        { name: 'table_id', required: true }
    ];

    const sendResponse = (message, details) => {
        _response_object = { message };
        if (details) _response_object.details = details;
        response.ok(_response_object);
    };

    validateModel.validate(ModelPrimary, input_attributes, filtered_post_data, async function (valid, errors) {
        if (valid) {
            try {
                // Find the table to get the creator_profile_id
                const table = await ModelSecond.findOne({ id: tableId });
                if (!table) {
                    return response.status(404).json({ error: 'Table not found' });
                }
                const createdBy = table.created_by;

                // const items = await ModelPrimary.findOne({ user_id: profileId, table_id: tableId, creator_profile_id: createdBy });
                const items = await ModelPrimary.findOne({ user_id: ProfileMemberId(request), table_id: tableId, creator_profile_id: createdBy });

                if (!items) {
                    // ModelPrimary does not exist, create new
                    const dataToCreate = {
                        // user_id: profileId,
                        user_id: ProfileMemberId(request),
                        table_id: +tableId,
                        creator_profile_id: +createdBy,
                        status: +bookmarkTable // set status initially to 13
                    };

                    const newData = await ModelPrimary.create(dataToCreate);
                    sendResponse(`${msg} created successfully.`, newData);

                    await updateCount(); // Update bookmarks count for tables

                } else {
                    // ModelPrimary exists, update
                    const updatedData = { ...items };
                    // if status as string will convert to number
                    const updateStatusCode = parseInt(items.status);

                    if (updateStatusCode === +setStatus) {
                        updatedData.status = +bookmarkTable; // Update status to bookmarkTable if it's currently 1

                    } else if (updateStatusCode === +bookmarkTable) {
                        updatedData.status = +setStatus; // Update status to 1 if it's currently bookmarkTable
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
                    const updateId = parseInt(tableId)

                    // Count table_id where status === bookmarkTable
                    const totalCount = await ModelPrimary.count({ table_id: +updateId, status: +bookmarkTable });

                    await ModelSecond.updateOne({ id: +updateId }, { bookmarks: totalCount });

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
