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
            console.log("==================== 4343343")
            const bookingEmailConole = await UseDataService.emailNotification(
                {
                    "type": "bookingEmailTemplate",
                    "include_email_tokens": [getBookedTable?.user_info?.email],
                    "custom_data": {
                        "user_name": getBookedTable?.user_info?.first_name,
                        "table_title": getBookedTable?.table_info?.title,
                        "pay_id": paymentDetails?.id,
                        "amount": getBookedTable?.amount
                    }
                }
            );
            
            console.log('bookingEmailConole',{bookingEmailConole});

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




            const TableName = await Tables.findOne({ id: parseInt(updatedBooking?.table_id) })
            await Notifications.updateOne({ pay_order_id: order_id, status: approved }).set({
                is_paid: 1,
                message: `Your payment for the ${TableName?.title} is completed.`
            });

            /******* Update booked table count after payment success *******/
            await UseDataService.countTablesBooked(ProfileMemberId(req))

            return res.json({ message: 'Payment captured and booking updated successfully', booking: updatedBooking });

        } else {

            return res.status(500).json({ error: 'No matching record found for table_booking_id:', table_id });

        }



        // if (!updatedBooking) {
        //     return res.status(500).json({ error: 'No matching record found for table_booking_id:', table_id });

        // } else {
        // }
    } catch (err) {
        console.error('Capture Payment Error:', err); // Log any errors

        // Return an error response
        return res.status(500).json({ error: 'Could not capture payment or update booking' });
    }
};