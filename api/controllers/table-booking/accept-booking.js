
/**
 *
 * @author Mohan <mohan@studioq.co.in>
 *
 */

module.exports = async function update(request, response) {
    const requestQuery = request.allParams();
    const { type } = requestQuery;
    const profileId = request.user.profile_members;
    let responseObject = {};
    const { bookingConfirmationPendingByCreator, bookingRejectByCreator, payPending, orederExpired, approved, reject } = UseDataService;

    const validStatusCodes = [payPending];
    const id = parseInt(requestQuery.id);
    if (!id || isNaN(id)) {
        responseObject.errors = [{
            message: 'Invalid or missing id. The id must be a valid number.'
        }];
        responseObject.count = 1;
        return response.status(400).json(responseObject);
    }
    const isCheckdata = await UseDataService.checkBookingTableCreatedByCurrentUser(
        {
            bookingId: id,
            userId: ProfileMemberId(request)
        }
    )

    if (!isCheckdata) {
        responseObject.error = "You cannot Accept or Reject booking. Tale not created by current user"
        return response.status(400).json(responseObject);
    }

    // Check if status is valid
    let acceptStatus;
    let status_glossary ;
    if (type === 'reject') {
        acceptStatus = bookingRejectByCreator;
        status_glossary = "bookingRejectByCreator";
    } else {
        status_glossary = "payPending";
        acceptStatus = payPending;
    }


    const filtered_post_data = { id, status: payPending };
    if (!validStatusCodes.includes(filtered_post_data.status)) {
        responseObject.errors = [{
            message: 'Invalid status. Valid status codes are ' + validStatusCodes.join(', ') + '.'
        }];
        responseObject.count = 1;
        return response.status(400).json(responseObject);
    }

    async function acceptBooking(id, acceptBooking) {
        TableBooking.update({ id }, { status: acceptBooking, status_glossary }, async function (err, acceptedData) {
            if (err) {
                await errorBuilder.build(err, function (error_obj) {
                    responseObject.errors = error_obj;
                    responseObject.count = error_obj.length;
                    return response.status(500).json(responseObject);
                });
            } else {
                if (acceptedData) {
                    // const orderId = await TableBooking.findOne({
                    //     user_id: acceptedData[0].user_id,
                    //     table_id: acceptedData[0].table_id,
                    //     status: payPending
                    // })

                 /* 
                    This function is removed 
                    Without accept user can directly book and pay.

                     const tableData = await Tables.findOne({
                        id: acceptedData[0].table_id,
                    })
                    const msg = await UseDataService.messages({ tableId: acceptedData[0].table_id, userId: acceptedData[0].user_id });
                   if (type === 'reject') {
                         await UseDataService.sendNotification({
                            notification: {
                                senderId: profileId,
                                type: 'bookingReject',
                                message: msg?.BookingRejectMsg,
                                receiverId: acceptedData[0].user_id,
                                followUser: null,
                                tableId: acceptedData[0].table_id,
                                payOrderId: acceptedData[0].order_id,
                                isPaid: false,
                                templateId: 'bookingReject',
                                roomName: 'AcceptBooking_',
                                creatorId: filtered_post_data?.creator_profile_id,
                                status: reject, // approved
                            },

                            pushMessage: {
                                title: tableData?.title,
                                payOrderId: null
                            }
                        });
                   
                    } else {
                        await UseDataService.sendNotification({
                            notification: {
                                senderId: profileId,
                                type: 'bookingAccept',
                                message: msg?.BookingAcceptMsg,
                                receiverId: acceptedData[0].user_id,
                                followUser: null,
                                tableId: acceptedData[0].table_id,
                                payOrderId: acceptedData[0].order_id,
                                isPaid: false,
                                templateId: 'bookingAccept',
                                roomName: 'AcceptBooking_',
                                creatorId: filtered_post_data?.creator_profile_id,
                                status: approved, // approved
                            },

                            pushMessage: {
                                title: tableData?.title,
                                payOrderId: acceptedData[0].order_id
                            }
                        });
                    } */
                }
                sendResponse(acceptedData);
            }
        });
    }

    function isUsersExist(id, callback) {
        TableBooking.findOne(
            {
                id,
                status: { '!=': _.get(sails, 'config.custom.statusCode.inactive') },
            },
            function (err, user) {
                UtilsService.throwIfErrorElseCallback(err, response, 400, () => {
                    if (!user) {
                        responseObject.message = 'No data found with the given id.';
                        return response.status(404).json(responseObject);
                    } else if (user.status !== bookingConfirmationPendingByCreator) {
                        if (user.status === orederExpired) {
                            responseObject.message = 'Order expired due to late, book again.';
                        } else {
                            responseObject.message = 'Booking status already accepted.';
                        }
                        return response.status(400).json(responseObject);
                    } else {
                        callback(user);
                    }
                });
            }
        );
    }

    function sendResponse(details) {
        Object.assign(responseObject, {
            message: 'Updated successfully.',
            details
        });

        response.ok(responseObject);
        return;

    }

    isUsersExist(id, async function () {
        await acceptBooking(id, acceptStatus, function (users) {
            let updatedUsers = _.omit(users);
            sendResponse(updatedUsers[0]);
        });
    });
};
