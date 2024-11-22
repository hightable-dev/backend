// cronjobCompletedEvent.js
const cron = require('node-cron');

// Schedule the task to run every minute
const jobCompletedEvent = cron.schedule('* * * * *', async () => {
    // Print current date and time to the console
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    console.log(`Current time: ${hours}:${minutes}:${seconds}`);

    console.log('Running completed event check...');

    const { eventStatusPending, approved, autoCancelledMinSeatsNotBooked, bookingClosed, refundRequest } = UseDataService;

    try {
        // Fetch tableData where the status is 'approved' and booked greater than 0
        // const tableData = await Tables.find({ status: approved, booked: { '>': 0 } });

        const tableData = await Tables.find({ status: approved });
        tableData?.forEach(async data => {
            let checkTimeNow = new Date(data.event_date);
            // let checkTimeNow = new Date(manualStingDate);
            checkTimeNow = UseDataService.dateHelperUtc(checkTimeNow)

            if (checkTimeNow.evnetDateBeforeTwoHours && data.booked < data.min_seats) {
                await Tables.updateOne({ id: data.id }).set({ status: autoCancelledMinSeatsNotBooked })
                console.log("Elements", { data: data.id, eventDate: data.event_date, status: data.status, checkTimeNow })
                let refundRequestTables = await TableBooking.update({ table_id: data.id }).set({ status: refundRequest });
                refundRequestTables?.forEach(async refundData => {
                    /* 
                    Notification to user
                     */
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

                        receiverId: data.created_byd,
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
                console.log({ tableId, eventDate, title, created_by })
                tableData.push({
                    table_id: tableId,
                    event_date: eventDate,
                });
                // const manualStingDate = "2024-11-08 14:20"
                let checkTimeNow = new Date(eventDate);
                // let checkTimeNow = new Date(manualStingDate);
                checkTimeNow = UseDataService.dateHelperUtc(checkTimeNow)

                /* >>>>>
                 * Check Event complete and sends notification to host
                 <<<<< */

                // console.log({ checkTimeNow })
                if (checkTimeNow.eventDateTimestampEqualNow) {

                    await Tables.update({ id: tableId })
                        .set({ status: eventStatusPending });

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
                }

                /* >>>>>
                * Checks booking reached 'min seats' and sends notification to host and user
                * Automatically Cancel the table
                * Send notification to user and host
                * Make refunds
                * update TableBooking and Tables                                
                <<<<< */

                // if (checkTimeNow.evnetDateBeforeTwoHours) {
                //     const checkMinBookingTrue = await Tables.findOne({
                //         id: tableId,
                //     });
                //     const { min_seats, booked } = checkMinBookingTrue;

                //     if (min_seats > booked || booked === 0) {

                //         console.log('There is mininum booking not reached tables', checkMinBookingTrue.id)
                //         const bookingList = await TableBooking.update({ table_id: checkMinBookingTrue.id }).set({ status: refundRequest })

                //         await Tables.updateOne({ id: checkMinBookingTrue.id }).set({ status: autoCancelledMinSeatsNotBooked })

                //         console.log({ bookingList })

                //         /* SEND NOTIFICATION TO HOST */
                //         await UseDataService.sendNotification({
                //             notification: {
                //                 senderId: created_by,
                //                 type: 'eventAutoCancel',
                //                 message: ` We regret to inform you that the table '${title}' has been cancelled as the minimum number of guests was not met.`,
                //                 receiverId: created_by,
                //                 followUser: null,
                //                 tableId,
                //                 payOrderId: '',
                //                 isPaid: true,
                //                 templateId: 'eventAutoCancel',
                //                 roomName: 'eventAutoCancel_',
                //                 creatorId: created_by,
                //                 status: 1,
                //             },
                //             pushMessage: {
                //                 title: 'Hightable',
                //             }
                //         });

                //         /* SEND NOTIFICATION TO USERS BOOKED */
                //         for (const list of bookingList) {
                //             const { creator_id, user_id } = list;
                //             console.log("sendNotificationToUser listbookinguser", { creator_id, user_id })

                //             /* SEND NOTIFICATION TO HOST */
                //             await UseDataService.sendNotification({
                //                 notification: {
                //                     senderId: creator_id,
                //                     type: 'eventAutoCancel',
                //                     message: ` We regret to inform you that the table '${title}' you've booked has been cancelled as the minimum number of guests was not met.`,
                //                     receiverId: user_id,
                //                     followUser: null,
                //                     tableId,
                //                     payOrderId: '',
                //                     isPaid: true,
                //                     templateId: 'eventAutoCancel',
                //                     roomName: 'eventAutoCancel_',
                //                     creatorId: creator_id,
                //                     status: 1,
                //                 },
                //                 pushMessage: {
                //                     title: 'Hightable',
                //                 }
                //             });

                //             console.log("sendNotificationToUser")

                //         }
                //     }
                // }
            }

            return tableData;

        } else {
            console.log('No tableData found.');
            return [];
        }


    } catch (error) {
        console.error('Error executing cron job:', error);
    }
}, {
    scheduled: true,
    timezone: "Asia/Kolkata" // Specify the timezone for IST
});

// Log the job setup
console.log('Cron job scheduled to run every minute');

// Start the cron job
jobCompletedEvent.start();

// Export the cron job for use in other parts of the application
module.exports = {
    jobCompletedEvent,
};
