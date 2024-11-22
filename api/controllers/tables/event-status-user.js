/**
 * 
 * @author mohan <mohan@studioq.co.in>
 * 
 * 
 */

/* global _, ProfileManagers /sails */

const common = require('../../services/common');

module.exports = function update(request, response) {
    // const { pending, approved, reject, bookingClosed, eventCompleted } = tableStatusCode;
    const { eventCompleted } = UseDataService;
    const profileId = request.user.profile_members;

    try {
        let { table_id, event_done_flag, user_id } = request.body;
        const updateData = { event_done_flag };

        // Validate input attributes
        const input_attributes = [
            { name: 'table_id', number: true, min: 1 },
            { name: 'event_done_flag' }
        ];

        updateData.status = eventCompleted;

        validateModel.validate(Tables, input_attributes, request.body, async function (valid, errors) {
            if (valid) {
                try {
                    const checkEveStatus = await EventStatus.findOne({ table_id, user_id: profileId });
                    const tableDetails = await Tables.findOne({ id: table_id });
                    if (!checkEveStatus.event_done_flag) {
                        // Update data of the Tables
                        const updatedEventStatus = await EventStatus.updateOne({ table_id: table_id, user_id: profileId }).set(updateData);
                        if (updatedEventStatus) {

                            await UseDataService.sendNotification({
                                notification: {
                                    senderId: profileId,
                                    type: 'eventCompleteStatus',
                                    message: request?.user?.first_name ? `'${request?.user?.first_name}' closed session for the table '${tableDetails.title}'` :  `Closed session for the table '${tableDetails.title}'`,
                                    receiverId:tableDetails.created_by,
                                    followUser: null,
                                    tableId: table_id,
                                    payOrderId: '',
                                    isPaid: true,
                                    templateId: 'EventAttend',
                                    roomName: 'EventAttend_',
                                    creatorId: tableDetails.created_by,
                                    status: 1,
                                },
                                pushMessage: {
                                    title: 'Event Complete',
                                }
                            });
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