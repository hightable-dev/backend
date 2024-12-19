/*
*** Booking jobs ***
 => Checks Min seats if not reached - will be cancelled before 2hrs.
 => If any pending booking will be marked as eventAutoCancelled.
 => If any bookings refund will be initiated.
 => If Min seats reached and booked full - Pending bookings will be marked as booking closed.

*** Profile jobs ***
=> Checks if profile not completed sends notification at 10 am daily.

*/

const { chownSync } = require('fs');
const cron = require('node-cron');

// Schedule the task to run every minute
const jobCompletedEvent = cron.schedule('* * * * *', async () => {
    // Print current date and time to the console
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    
    const { payPending, paymentSuccess, eventStatusPending, approved, autoCancelledMinSeatsNotBooked, bookingClosed, refundRequest, orederExpired } = UseDataService;

    try {

        const tableData = await Tables.find({ status: approved });
        const tableBookingData = await TableBooking.find({ status: payPending })
        tableBookingData?.forEach(async data => {
            let checkTimeNow = new Date(data.expiry_date);
            checkTimeNow = UseDataService.dateHelperUtc(checkTimeNow)

            if(checkTimeNow.eventDateTimestampLessThanNow || checkTimeNow.eventDateTimestampEqualNow){
                    await TableBooking.update({ status: payPending }).set({ status: orederExpired });
            }

        })

        tableData?.forEach(async data => {
            let checkTimeNow = new Date(data.event_date);
            checkTimeNow = UseDataService.dateHelperUtc(checkTimeNow)

            if (checkTimeNow.evnetDateBeforeTwoHours && data.booked < data.min_seats) {
                await Tables.updateOne({ id: data.id }).set({ status: autoCancelledMinSeatsNotBooked });

                /* Stop making payment if any order is created for the table */
                await TableBooking.update({ table_id: data.id, status: payPending }).set({ status: autoCancelledMinSeatsNotBooked });

                /* Intiating the refund for the booking success */
                let refundRequestTables = await TableBooking.update({ table_id: data.id, status: paymentSuccess }).set({ status: refundRequest });
                refundRequestTables?.forEach(async refundData => {

                    /* Notification to user */
                    await UseDataService.sendNotification({
                        notification: {
                            senderId: refundData.creator_id,
                            type: 'EventAutoCancel',
                            message: ` We regret to inform you that the table '${data.title}' you've booked has been cancelled as the minimum number of guests was not met.`,
                            receiverId: refundData.user_id,
                            followUser: null,
                            tableId: refundData.table_id,
                            payOrderId: '',
                            isPaid: true,
                            templateId: 'EventAutoCancel',
                            roomName: 'EventAutoCancel_',
                            creatorId: refundData.creator_id,
                            status: 1,
                        },
                        pushMessage: {
                            title: 'Event status',
                        }
                    });

                    await UseDataService.initiateRefund({
                        userId: refundData.user_id,
                        tableId: refundData.table_id,
                    });
                })

                /* Notification to host */
                await UseDataService.sendNotification({
                    notification: {
                        senderId: data.created_by,
                        type: 'EventAutoCancel',
                        message: ` We regret to inform you that the table '${data.title}' has been cancelled as the minimum number of guests was not met.`,
                        receiverId: data.created_by,
                        followUser: null,
                        tableId: data.id,
                        payOrderId: '',
                        isPaid: true,
                        templateId: 'EventAutoCancel',
                        roomName: 'EventAutoCancel_',
                        creatorId: data.id,
                        status: 1,
                    },
                    pushMessage: {
                        title: 'Event status',
                    }
                });
            }
        });

        // Check if there are any tableData returned
        if (tableData && tableData.length > 0) {
            const tableData = [];

            // Loop through each booking and process it
            for (const booking of tableData) {
                let { id: tableId, event_date: eventDate, title, created_by } = booking;
                tableData.push({
                    table_id: tableId,
                    event_date: eventDate,
                });
                // const manualStingDate = "2024-11-08 14:20"
                let checkTimeNow = new Date(eventDate);
                // let checkTimeNow = new Date(manualStingDate);
                checkTimeNow = UseDataService.dateHelperUtc(checkTimeNow)

                /* -----------------------
                 * Check Event complete and sends notification to host
                 *---------------------- */

                if (checkTimeNow.eventDateTimestampEqualNow) {

                    await Tables.update({ id: tableId })
                        .set({ status: eventStatusPending });

                    /* Stop booking payment if event started */
                    await TableBooking.update({ table_id: data.id, status: payPending }).set({ status: bookingClosed });

                    await UseDataService.sendNotification({
                        notification: {
                            senderId: created_by,
                            type: 'eventCompleteStatus',
                            message: `The table '${title}' is now completed. You can ask the attendees to mark it as completed.`,
                            receiverId: created_by,
                            followUser: null,
                            tableId,
                            payOrderId: '',
                            isPaid: true,
                            templateId: 'eventCompleteStatus',
                            roomName: 'EventComplete_',
                            creatorId: created_by,
                            status: 1,
                        },
                        pushMessage: {
                            title: 'Event status',
                        }
                    });
                };
            };

            return tableData;

        } else {
            return [];
        };

    } catch (error) {
        throw err;
    };
}, {
    scheduled: true,
    timezone: "Asia/Kolkata" // Specify the timezone for IST
});

// Start the cron job
jobCompletedEvent.start();

// Export the cron job for use in other parts of the application
module.exports = {
    jobCompletedEvent,
};
