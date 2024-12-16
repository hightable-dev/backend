const RazorpayService = require("../../services/RazorpayService");

// Map to store idempotency keys
const idempotencyKeyMap = new Map();

module.exports = async function refundPayment(req, res) {
  // const profileId = req.user.profile_members;
  const { refundRequest, refundSuccess } = UseDataService;

  try {
    // const { paymentId } = req.body;
    const { bookingTableId } = req.body;
    const bookings = await TableBooking.find({
      table_id: bookingTableId,
      status: refundRequest,
    });
    const tableDetails = await Tables.find({ id: bookingTableId });
    // const memberDetails = await ProfileMembers.find({ id: 360 });
    const paymentId = bookings.map((booking) => booking.payment_id);
    // Check if the paymentId is an array
    if (!Array.isArray(paymentId)) {
      return res.badRequest({ error: "paymentId must be an array" });
    }

    // Initialize an array to store refund responses for each payment
    const refundResponses = [];

    // Loop through each paymentId and initiate refunds
    for (const payId of paymentId) {
      // Check if the idempotency key for this payment ID exists
      if (idempotencyKeyMap.has(payId)) {
        // If idempotency key exists, skip this paymentId
        continue;
      }

      // Add idempotency key to the map to prevent duplicate refund requests
      const idempotencyKey = RazorpayService.generateUniqueReceiptNumber(payId);
      idempotencyKeyMap.set(payId, idempotencyKey);

      try {
        // Retrieve the payment details from Razorpay
        const paymentDetails = await RazorpayService.instance.payments.fetch(
          payId
        );
        const actualAmountPaid = paymentDetails.amount;

        // Initiate the refund with the actual amount paid
        const refundResponse = await RazorpayService.instance.payments.refund(
          payId,
          {
            amount: actualAmountPaid, // Refund the actual amount paid
            speed: "normal",
            notes: {
              title: tableDetails.title,
              description: "Event was cancelled.",
            },
            receipt: RazorpayService.generateUniqueReceiptNumber(payId), // Use the unique receipt number
            idempotency_key: idempotencyKey, // Use the idempotency key to prevent duplicate requests
          }
        );

        // Remove the idempotency key from the map after successful refund
        idempotencyKeyMap.delete(payId);
        await TableBooking.updateOne(
          { payment_id: payId },
          { refund_details: refundResponse, status: refundSuccess }
        );
        // Push the refund response to the array
        refundResponses.push(refundResponse);

        const bookedUserIds = [];

        for (const data of bookings) {
          bookedUserIds.push(data.user_id);

          // Fetch the message once per booking
          const msg = await UseDataService.messages({
            tableId: bookingTableId,
            userId: data.user_id,
          });
          // Notify each user
        }
          for (const userId of bookedUserIds) {
            await UseDataService.sendNotification({
              notification: {
                senderId: ProfileMemberId(req),
                type: "Refund",
                message: msg?.RefundSuccessMsg,
                receiverId: userId,
                followUser: null,
                tableId: bookingTableId,
                payOrderId: "",
                isPaid: true,
                templateId: "refundSuccess",
                roomName: "Refund_",
                creatorId: userId,
                status: 1, // approved
              },

              pushMessage: {
                title: "High Table",
                tableId: bookingTableId,
              },
            });
          }
      } catch (error) {
        // Handle errors
        // Remove the idempotency key from the map in case of error
        idempotencyKeyMap.delete(payId);
        return res.badRequest(error);
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
    return res.serverError({ error: error.message });
  }
};
