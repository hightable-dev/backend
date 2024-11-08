
/**
 *
 * @author Mohan <mohan@studioq.co.in>
 *
 */

module.exports = async function update(request, response) {
    const requestQuery = request.allParams();
    const { type } = requestQuery;
    const profileId = request.user.profile_members;
    const responseObject = {};
    const { bookingConfirmationPendingByCreator, bookingRejectByCreator, payPending, orederExpired } = paymentStatusCode;
    const { pending, approved, reject } = tableStatusCode;

    const validStatusCodes = [payPending];
    const id = parseInt(requestQuery.id);
    if (!id || isNaN(id)) {
        responseObject.errors = [{
            message: 'Invalid or missing id. The id must be a valid number.'
        }];
        responseObject.count = 1;
        return response.status(400).json(responseObject);
    }

    // Check if status is valid
    let acceptStatus;
    if (type === 'reject') {
        acceptStatus = bookingRejectByCreator;
    } else {
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

    async function acceptBooking(id, acceptBooking, callback) {
        TableBooking.update({ id }, { status: acceptBooking }, async function (err, acceptedData) {
            if (err) {
                await errorBuilder.build(err, function (error_obj) {
                    responseObject.errors = error_obj;
                    responseObject.count = error_obj.length;
                    return response.status(500).json(responseObject);
                });
            } else {
                if (acceptedData) {
                    const orderId = await TableBooking.findOne({
                        user_id: acceptedData[0].user_id,
                        table_id: acceptedData[0].table_id,
                        status: payPending
                    })

                    const tableData = await Tables.findOne({
                        id: acceptedData[0].table_id,
                    })

                    if (type === 'reject') {
                        await notificationService({
                            senderId: profileId,
                            type: 'bookingReject',
                            message: `Booking not accepted by the host for the '${tableData?.title}'.`,
                            receiverId: acceptedData[0].user_id,
                            followUser: null,
                            tableId: acceptedData[0].table_id,
                            payOrderId: acceptedData[0].order_id,
                            isPaid: false,
                            templateId: 'bookingReject',
                            roomName: 'AcceptBooking_',
                            creatorId: filtered_post_data?.creator_profile_id,
                            status: reject, //reject
                            pushMsgTitle: tableData?.title,    // Title, Name ...
                            pushMessage: `Booking not accepted by the host for the '${tableData?.title}'.`
                        });

                        await Notifications.update({ pay_order_id: acceptedData[0].order_id, status: 1 }).set({
                            message: `Booking not accepted by you.`
                        });

                    } else {
                        console.log('DataService', UseDataService)

                        await UseDataService.sendNotification({
                            notification: {
                                senderId: profileId,
                                type: 'bookingAccept',
                                message: `Congratulations! your booking request for the '${tableData?.title}' is confirmed by the host. Tap here to pay now .`,
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
                                message: `Congratulations! your booking request accepted for the '${tableData?.title}'.`,
                                payOrderId:  acceptedData[0].order_id
                            }
                        });

                        UseDataService.updateRecord({
                            modelName: 'Notifications',
                            matchCriteria: { pay_order_id: orderId.order_id, status: 1 },
                            values: {
                                message: `Booking accepted by you.`
                            },
                        })
                    }
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
                // creator_id: ProfileMemberId(request)
            },
            function (err, user) {
                UtilsService.throwIfErrorElseCallback(err, response, 400, () => {
                    if (!user) {
                        responseObject.message = 'No data found with the given id.';
                        return response.status(404).json(responseObject);
                    } else if (user.status !== bookingConfirmationPendingByCreator) {
                        if (user.status === orederExpired) {
                            responseObject.message = 'Booking accepted and expired booking.';
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

    async function sendResponse(details) {
        Object.assign(responseObject, {
            message: 'Updated successfully.',
            details
        });
        return response.ok(responseObject);
    }

    isUsersExist(id, async function (user_detail) {
        await acceptBooking(id, acceptStatus, function (users) {
            let updatedUsers = _.omit(users);
            sendResponse(updatedUsers[0]);
        });
    });
};
