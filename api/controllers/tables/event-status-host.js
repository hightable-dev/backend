/**
 * @author mohan <mohan@studioq.co.in>
 */

/* global _, ProfileManagers /sails */
const common = require('../../services/common');


module.exports = async function update(request, response) {
    const { pending, approved, reject, bookingClosed, eventCompleted } = tableStatusCode;
    try {
        const { table_id, event_done_flag, status } = request.body;
        const updateData = { event_done_flag, status };
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

                    const checkEveStatus = await Tables.findOne({ id: table_id });

                    if (!checkEveStatus.event_done_flag) {
                        // Update data of the Tables
                        const updatedTable = await Tables.updateOne({ id: table_id }).set(updateData);
                        // If the table is not found, return an appropriate response
                        if (!updatedTable) {
                            return response.status(404).json({ error: 'Table not found' });
                        }

                        // Retrieve all bookings for the updated table
                        const allBookings = await TableBooking.find({ table_id });
                        if (allBookings.length === 0) {
                            return response.status(400).json({ error: 'No bookings found', message: 'event status updated as complete' });
                        } else {

                            const groupedBookings = {};
                            // let count = 0;
                            await allBookings.forEach(booking => {
                                const key = `${booking.user_id}_${booking.table_id}`;
                                // If the key doesn't exist in groupedBookings or if it's the first entry for this key
                                if (!groupedBookings[key]) {
                                    groupedBookings[key] = booking;
                                }

                            });
                            const userCount = Object.keys(groupedBookings).length;
                            // You can loop through each group and insert the unique data into the EventStatus model
                            Object.values(groupedBookings).forEach(async booking => {
                                const requestData = {
                                    table_id: booking.table_id,
                                    creator_id: checkEveStatus.created_by,
                                    user_id: booking.user_id,
                                };
                                const eventDone = await EventStatus.create(requestData);

                                await Notifications.create(
                                    {
                                        // sender: logged_in_user?.profile_members, // table created
                                        sender: ProfileMemberId(request), // table created
                                        // sender: checkEveStatus.created_by, // table created
                                        type: "EventComplete",
                                        message: `Notified to all users`,
                                        table_id: table_id,
                                        receiver: eventDone.user_id
                                    },
                                    async function (err, notification) {
                                        var roomName = 'EventComplete' + notification?.receiver;
                                        notification.user = notification?.receiver
                                        socketService.notification(roomName, notification);

                                        var push_data = {
                                            // title: `${logged_in_user?.first_name} created ${createdTable?.title} table`,
                                            title: `Your event completed the table is ${checkEveStatus.title} `,
                                            message: checkEveStatus.description,
                                            player_ids: `user-${eventDone.user_id}`,
                                        };
                                        push_data.data = {
                                            templateId: 'EventComplete',
                                            id: table_id,

                                        };
                                        await pushService.sendPush(push_data, function (data, error) {

                                        })

                                    }
                                );
                            });

                            const bookings = await TableBooking.find({ table_id: table_id });
                            const totalAmount = common.calculateSum(bookings, 'amount');

                            const payoutHostDetails = {
                                table_id: table_id,
                                creator_id: checkEveStatus.created_by,
                                users_count: userCount,
                                total_payment: totalAmount
                            }

                            const payoutHost = await PayoutHost.create(payoutHostDetails);
                            // Build and send response with updated details
                            return response.ok({ message: 'Event details updated', details: updatedTable, bookings: allBookings });
                        }
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