/**
 * @author mohan <mohan@studioq.co.in>
 */

/* global _, ProfileManagers /sails */
const common = require('../../services/common');


module.exports = function update(request, response) {
    // const { pending, approved, reject, bookingClosed, eventCompleted } = tableStatusCode;
    const {eventCompleted } = UseDataService;
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
                            return response.notFound({ error: 'Table not found' });
                        }

                        // Retrieve all bookings for the updated table
                        const allBookings = await TableBooking.find({ table_id });
                        if (allBookings.length === 0) {
                            return response.badRequest({ error: 'No bookings found', message: 'event status updated as complete' });
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

                                await UseDataService.sendNotification({
                                    notification: {
                                        senderId: ProfileMemberId(request),
                                        type: 'eventCompleteStatus',
                                        message: `We hope you enjoyed the '${checkEveStatus.title}'. As the event is ended, please click here to close the session..`,
                                        receiverId: eventDone.user_id,
                                        followUser: null,
                                        tableId: table_id,
                                        payOrderId: '',
                                        isPaid: true,
                                        templateId: 'EventComplete',
                                        roomName: 'EventComplete_',
                                        creatorId: checkEveStatus.created_by,
                                        status: 1,
                                    },
                                    pushMessage: {
                                        title: 'Event Complete',
                                        // message: `We hope you enjoyed the '${checkEveStatus.title}'. As the event is ended, please click here to close the session..`,
                                    }
                                });
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
                        return response.badRequest({ error: 'Already event completed', message: 'Payment proccessed for the event' });
                    }

                } catch (error) {
                    return response.serverError({ message: 'Error updating table data', error });
                }
            } else {
                return response.badRequest({ errors, count: errors.length });
            }
        });

    } catch (error) {
        response.serverError({message : 'Error updating status', error });
    }
};