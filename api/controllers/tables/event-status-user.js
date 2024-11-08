/**
 * 
 * @author mohan <mohan@studioq.co.in>
 * 
 * 
 */

/* global _, ProfileManagers /sails */

const common = require('../../services/common');

module.exports = async function update(request, response) {
    const { pending, approved, reject, bookingClosed, eventCompleted } = tableStatusCode;
    try {
        let { table_id, event_done_flag, user_id } = request.body;
        const updateData = { event_done_flag };
        let _response_object = {};

        // Validate input attributes
        const input_attributes = [
            { name: 'table_id', number: true, min: 1 },
            { name: 'event_done_flag' }
        ];

        updateData.status = eventCompleted;

        validateModel.validate(Tables, input_attributes, request.body, async function (valid, errors) {
            if (valid) {
                try {

                    const checkEveStatus = await EventStatus.findOne({ table_id: table_id, user_id: user_id });
                    const tableDetails = await Tables.findOne({ id: table_id });
                    if (!checkEveStatus.event_done_flag) {
                        // Update data of the Tables
                        const updatedEventStatus = await EventStatus.updateOne({ table_id: table_id, user_id: user_id }).set(updateData);
                        if (updatedEventStatus) {
                            await Notifications.create(
                                {
                                    // sender: logged_in_user?.profile_members, // table created
                                    sender: user_id, // table created
                                    // sender: checkEveStatus.created_by, // table created
                                    type: "EventAttend",
                                    message: `Notified to creator`,
                                    table_id: table_id,
                                    receiver: tableDetails.created_by
                                },
                                async function (err, notification) {
                                    var roomName = 'EventAttend' + notification?.receiver;
                                    notification.user = notification?.receiver
                                    socketService.notification(roomName, notification);

                                    var push_data = {
                                        // title: `${logged_in_user?.first_name} created ${createdTable?.title} table`,
                                        title: `Thanks for the event ${checkEveStatus.title} `,
                                        message: checkEveStatus.description,
                                        player_ids: `user-${user_id}`,
                                    };
                                    push_data.data = {
                                        templateId: 'EventAttend',
                                        id: table_id,

                                    };

                                    await pushService.sendPush(push_data, function (data, error) {

                                    })

                                }
                            );
                        }


                        // If the table is not found, return an appropriate response
                        if (!updatedEventStatus) {
                            return response.status(404).json({ error: 'Table not found' });
                        }

                        const allBookings = await TableBooking.find({ table_id: table_id, user_id: user_id });

                        if (allBookings.length === 0) {
                            return response.status(400).json({ error: 'No bookings found', message: 'event status updated as complete' });
                        }

                        // Update event_done_flag to true for all bookings
                        const eventAttended = await TableBooking.update({ table_id: table_id, user_id: user_id }).set({ event_done_flag: true });
                        const confirmedPayment = await TableBooking.find({ table_id: table_id , event_done_flag: true });
                        const notConfirmedPayment = await TableBooking.find({ table_id: table_id , event_done_flag: false });
                        const payableAmount = common.calculateSum(confirmedPayment, 'amount');
                        const pendingAmount = common.calculateSum(notConfirmedPayment, 'amount');
                        const attendedUserCount = await EventStatus.count({ table_id: table_id, event_done_flag: true });

                        const payoutDetails = {
                            payout: payableAmount,
                            pending_payment : pendingAmount,
                            user_attended_count : attendedUserCount
                        }

                        await PayoutHost.updateOne({ table_id: table_id }).set(payoutDetails);

                        return response.ok({ message: 'Event details updated', bookings: eventAttended });

                    } else {
                        return response.status(400).json({ error: 'Already event completed', message: 'Payment proccessed for the event' });
                    }

                } catch (error) {
                    console.error('Error updating table data:', error);
                    return response.status(500).json({ error: 'Error updating table data' });
                }
            } else {
                return response.status(400).json({ errors, count: errors.length });
            }
        });

    } catch (error) {
        console.error("Error occurred while updating Tables data:", error);
        response.status(500).json({ error: "Error occurred while updating Tables data" });
    }
};