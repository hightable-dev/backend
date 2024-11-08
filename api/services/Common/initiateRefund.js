const idempotencyKeyMap = new Map();
const { payPending, orederExpired, refundRequest, refundSuccess, paymentSuccess } = paymentStatusCode;

module.exports = async function (data) {

    /**
     * @Param table id required
     * @Param user id required
     * */
    console.log('DataService-Object', data);
    try {
        const bookings = await TableBooking.find({ table_id: data.tableId, status: refundRequest });
        console.log('bookings', bookings)
        const tableDetails = await Tables.find({ id: data.tableId });

        const paymentId = bookings.map(booking => booking?.payment_id);
        // Check if the paymentId is an array
        if (!Array.isArray(paymentId)) {
            throw new Error({ error: 'paymentId must be an array' });
        }

        const refundResponses = [];

        for (const payId of paymentId) {
            // Check if the idempotency key for this payment ID exists
            if (idempotencyKeyMap.has(payId)) {
                // If idempotency key exists, skip this paymentId
                console.log(`Refund request is already in progress for payment ID: ${payId}`);
                continue;
            }

            // Add idempotency key to the map to prevent duplicate refund requests
            const idempotencyKey = RazorpayService.generateUniqueReceiptNumber(payId);
            idempotencyKeyMap.set(payId, idempotencyKey);

            try {
                // Retrieve the payment details from Razorpay
                const paymentDetails = await RazorpayService.instance.payments.fetch(payId);
                const actualAmountPaid = paymentDetails.amount;

                // Initiate the refund with the actual amount paid
                const refundResponse = await RazorpayService.instance.payments.refund(payId, {
                    amount: actualAmountPaid, // Refund the actual amount paid
                    speed: 'normal',
                    notes: {
                        title: tableDetails.title,
                        description: 'Event was cancelled.'
                    },
                    receipt: RazorpayService.generateUniqueReceiptNumber(payId), // Use the unique receipt number
                    idempotency_key: idempotencyKey // Use the idempotency key to prevent duplicate requests
                });

                // Remove the idempotency key from the map after successful refund
                idempotencyKeyMap.delete(payId);
                await TableBooking.updateOne({ payment_id: payId }, { refund_details: refundResponse, status: refundSuccess });
                // Push the refund response to the array
                refundResponses.push(refundResponse);

                for (const data of bookings) {
                    console.log("data of booking", data)
                    const tableDetails = await Tables.findOne({ id: data.table_id });
                    logdata("data of booking-> table details", tableDetails)

                    const user = await Users.findOne({ profile_members: data.user_id });
                    // Do something with the user data here
                    await notificationService({
                        senderId: data.userId,
                        type: 'Refund',
                        message: `Booking not accepted by the host for the ' Table title Here'.`,
                        receiverId: user?.profile_members,
                        followUser: null,
                        tableId: data.table_id,
                        payOrderId: '',
                        isPaid: false,
                        templateId: 'refund',
                        roomName: 'Refund_',
                        creatorId: data.userId,
                        status: 1, //reject
                        pushMessage: `Refund intitiated for the table '${tableDetails.title.charAt(0).toUpperCase()}${tableDetails.title.slice(1)}'.`
                    });
                }
            } catch (error) {
                // Handle errors
                console.error(`Error occurred during refund for payment ID ${payId}:`, error);
                // Remove the idempotency key from the map in case of error
                idempotencyKeyMap.delete(payId);
                throw new Error(error);

            }
        }

        console.log("refundResponses", refundResponses)

        return;
    } catch (error) {
        throw new Error('Error fetching bookings: ' + error.message);
    }
};
