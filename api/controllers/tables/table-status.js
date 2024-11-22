/**
 * @author mohan <mohan@studioq.co.in>
 */

/* global _, ProfileManagers /sails */
module.exports = function updateStatus(request, response) {
    var _response_object = {};
    // Extract table ID and status from request body
    const { id, status } = request.body;
    const { inactive, pending, approved, reject, bookingClosed, cancelled } = UseDataService;
    const validStatusCodes = [pending, approved, reject, bookingClosed, cancelled];

    // Validate input
    if (!id || status === undefined) {
        return response.badRequest({ error: 'Table ID and status are required.' });
    }

    // Check if status is valid
    if (!validStatusCodes.includes(status)) {
        return response.badRequest({
            error: 'Invalid status code.',
            valid_status: `${inactive}-inactive,${pending}-pending,${approved}-approved,${reject}-reject,${bookingClosed}-bookingClosed,${cancelled}-cancelled`
        });
    }

    // Find the table with the given ID
    Tables.findOne({ id }).exec((err, table) => {
        if (err) {
            console.error("Error occurred while finding table:", err);
            return response.serverError({ error: "Error occurred while finding table." });
        }

        if (!table) {
            return response.badRequest({ error: 'Table not found.' });
        }

        // Check if table status is already the same as the provided status
        if (status === inactive && table.status === inactive) {
            return response.badRequest({ error: 'Table is already deactivated.' });
        }

        // Check if table status is already approved (status === 3)
        if (status === approved && table.status === approved) {
            return response.badRequest({ error: 'Table is already approved.' });
        }

        // Check if table status is already pending (status === 6)
        if (status === pending && table.status === pending) {
            return response.badRequest({ error: 'Table is already in pending List.' });
        }
        if (status === reject && table.status === reject) {
            return response.badRequest({ error: 'Table is already in reject.' });
        }
        if (status === bookingClosed && table.status === bookingClosed) {
            return response.badRequest({ error: 'Table booked full' });
        }
        if (status === cancelled && table.status === cancelled) {
            return response.badRequest({ error: 'Table is already cancelled' });
        }

        // Update table status
        Tables.updateOne({ id })
            .set({ status })
            .exec((err, updatedTable) => {
                if (err) {
                    console.error("Error occurred while updating table status:", err);
                    return response.serverError({ error: "Error occurred while updating table status." });
                }
                // Create new data in TablesStatus model for commit
                TableStatus.create({
                    table_id: id,
                    status: status,
                    last_checkin_via: 'web',
                    admin_id: ProfileAdminOrManagerId(request) ? ProfileAdminOrManagerId(request) : 0,
                    // admin_type: UserType(request), changed to user type
                    user_type: UserType(request),
                    table_creator_id: table.created_by,


                }).exec(async (err, createdData) => {
                    if (err) {
                        console.error("Error occurred while creating new data in TablesStatus model:", err);
                        return response.serverError({ error: "Error occurred while creating new data." });
                    }

                    await UseDataService.countTablesHosted(table.created_by)

                    // Send response
                    _response_object = {
                        message: 'Table status updated successfully and new data created in TablesStatus.',
                        updatedTable: updatedTable,
                        createdData: createdData,
                    }

                    response.ok(_response_object);
                    
                    const msg = await UseDataService.messages({ tableId: id });
                    console.log({msg,status});

                    await UseDataService.sendNotification({
                        notification: {
                            senderId: table.created_by,
                            type: status === approved ? 'TableApproved'
                                : status === reject ? 'TableReject' : null,
                            message: status === approved ? msg.TableApproveMsg
                                : status === reject ? msg.TableRejectMsg : null,
                            receiverId: table.created_by,
                            followUser: null,
                            tableId: id,
                            payOrderId: '',
                            isPaid: true,
                            templateId: status === approved ? 'tableApprove'
                                : status === reject ? 'tableReject' : null,
                            roomName: 'TableStatus_',
                            creatorId: table.created_by,
                            status: 1, // approved
                        },
                        pushMessage: {
                            title: 'High Table',
                            tableId: id,
                        }
                    });

                    return;
                });
            });
    });
};
