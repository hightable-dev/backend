/**
 * @author mohan <mohan@studioq.co.in>
 */

/* global _, ProfileManagers /sails */

const Razorpay = require('razorpay');


module.exports = async function capturePayment(req, res) {
    const { paymentSuccess, approved } = UseDataService;
    const profileId = req.user.profile_members;
    // const { table_id, order_id, payment_id } = req.body;
    const { payment_id } = req.body;
    let order_id, table_id;
    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    try {
        // const capturedPayment = await razorpay.payments.capture(payment_id, amount * 100); // Convert amount to paisa
        const paymentDetails = await razorpay.payments.fetch(payment_id);
        order_id = paymentDetails.order_id;
        // Update TableBooking with the captured payment details
        const updatedBooking = await TableBooking.updateOne({ order_id }).set({
            payment_details: paymentDetails, // Use the full captured payment response from Razorpay
            payment_id: paymentDetails.id,
            status: paymentSuccess,
            status_glossary: "paymentSuccess"
        });
        const getBookedTable = await TableBooking.findOne({ order_id })
        table_id = getBookedTable?.table_id;
        if (updatedBooking) {
            /** Update the booked Seats count  in Tables*/
            const totalBookedSeats = await TableBooking.find({ table_id, status: paymentSuccess });

            await Tables.updateOne({ id: parseInt(table_id) }).set({
                booked: totalBookedSeats.length, // Use the full captured payment response from Razorpay
                booked_seats: totalBookedSeats.length, // Use the full captured payment response from Razorpay
            });

            const tableData = await Tables.findOne({ id: parseInt(getBookedTable?.table_id) });
            try {
                await UseDataService.emailNotification(
                    {
                        "type": "bookingEmailTemplate",
                        "include_email_tokens": [getBookedTable?.user_details?.email],
                        "custom_data": {
                            "user_name": getBookedTable?.user_details?.first_name,
                            "table_title": getBookedTable?.table_details?.title,
                            "pay_id": paymentDetails?.id,
                            "amount": getBookedTable?.amount
                        }
                    }
                );

            } catch(err) {
                // throw ('Error Sending Email Notifcation');
                throw err;
            }
            try {
                await UseDataService.sendNotification({
                    notification: {
                        senderId: profileId,
                        type: 'bookingConfirm',
                        message: `Congratulations! You got a new booking! for the table '${tableData?.title}'.`,
                        receiverId: getBookedTable.creator_id,
                        followUser: null,
                        tableId: getBookedTable.table_id,
                        payOrderId: '',
                        isPaid: true,
                        templateId: 'bookingConfirm',
                        roomName: 'AcceptBooking_',
                        creatorId: getBookedTable.creator_id,
                        status: approved, // approved
                    },
                    pushMessage: {
                        title: tableData?.title,
                        // message: `Congratulations! Booking confirmed '${tableData?.title}'.`,
                    }
                });

            } catch (err) {
                // throw ('Error Sending Notifcation for booking');
                throw err;
            }


            const TableName = await Tables.findOne({ id: parseInt(updatedBooking?.table_id) })
            try {
                await Notifications.updateOne({ pay_order_id: order_id, status: approved }).set({
                    is_paid: 1,
                    message: `Your payment for the ${TableName?.title} is completed.`
                });
            } catch (e) {
                throw e ;
                // throw new Error('Error updating notifcation')
            }


            /******* Update booked table count after payment success *******/
            await UseDataService.countTablesBooked(ProfileMemberId(req))
            return res.json({ message: 'Payment captured and booking updated successfully', booking: updatedBooking });
        } else {
            throw ({status: 400, message: 'No matching record found for table_booking_id ' });
        }
    } catch (e) {
        throw (e);
    }
};