const RazorpayService = require('../../services/RazorpayService');

// Map to store idempotency keys
const idempotencyKeyMap = new Map();

module.exports = async function refundPayment(req, res) {
    const profileId = req.user.profile_members;

  const { payPending, orederExpired, refundRequest, refundSuccess, paymentSuccess } = paymentStatusCode;

  try {
    // const { paymentId } = req.body;
    const { bookingTableId } = req.body;
    const bookings = await TableBooking.find({ table_id: bookingTableId, status: refundRequest });
    const tableDetails = await Tables.find({ id: bookingTableId });
    // const memberDetails = await ProfileMembers.find({ id: 360 });
    const paymentId = bookings.map(booking => booking.payment_id);
    // Check if the paymentId is an array
    if (!Array.isArray(paymentId)) {
      return res.status(400).json({ error: 'paymentId must be an array' });
    }

    // Initialize an array to store refund responses for each payment
    const refundResponses = [];

    // Loop through each paymentId and initiate refunds
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
          const tableDetails = await Tables.findOne({ id: data.table_id });
          const user = await Users.findOne({ profile_members: data.user_id });
          // Do something with the user data here
          await notificationService({
            senderId: profileId    ,
            type: 'Refund',
            message: `Booking not accepted by the host for the ' Table title Here'.`,
            receiverId: user?.profile_members,
            followUser: null,
            tableId: bookingTableId,
            payOrderId: '',
            isPaid: false,
            templateId: 'refund',
            roomName: 'Refund_',
            creatorId: profileId,
            status: 1, //reject
            pushMsgTitle:`'${tableDetails.title.charAt(0).toUpperCase()}${tableDetails.title.slice(1)}' was cancelled.`,    // Title, Name ...
            pushMessage: `Refund intitiated for the table '${tableDetails.title.charAt(0).toUpperCase()}${tableDetails.title.slice(1)}'.`
        });


        }
      } catch (error) {
        // Handle errors
        console.error(`Error occurred during refund for payment ID ${payId}:`, error);
          // Remove the idempotency key from the map in case of error
          idempotencyKeyMap.delete(payId);
        return res.status(400).json(error);
      
      }
    }

    // Send the refund responses back to the client
    return res.json(refundResponses);
  } catch (error) {
    // Remove the idempotency keys from the map in case of error
    for (const payId of paymentId) {
      idempotencyKeyMap.delete(payId);
    }

    // Handle errors
    console.error('Error occurred during refund:', error);
    return res.status(500).json({ error: error.message });
  }
};
