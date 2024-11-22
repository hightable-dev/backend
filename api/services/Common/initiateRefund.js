const idempotencyKeyMap = new Map();
const {
  payPending,
  orederExpired,
  refundRequest,
  refundSuccess,
  paymentSuccess,
} = paymentStatusCode;

module.exports = async function (data) {

  /**
   * @Param table id required
   * @Param user id required
   * */
  let status_code ;
  try {
    const bookings = await TableBooking.find({
      table_id: data.tableId,
      status: refundRequest,
    });
    const tableDetails = await Tables.find({ id: data.tableId });

    const paymentId = bookings.map((booking) => booking?.payment_id);
    // Check if the paymentId is an array
    if (!Array.isArray(paymentId)) {
      throw new Error({ error: "paymentId must be an array" });
    }

    const refundResponses = [];

    for (const payId of paymentId) {
      // Check if the idempotency key for this payment ID exists
      if (idempotencyKeyMap.has(payId)) {
        // If idempotency key exists, skip this paymentId
        console.log(
          `Refund request is already in progress for payment ID: ${payId}`
        );
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
        status_code = refundSuccess;
        // Push the refund response to the array
        refundResponses.push(refundResponse);

        for (const bookingData of bookings) {
          const tableDetails = await Tables.findOne({ id: data.tableId });
          logdata("data of booking-> table details", tableDetails);

          const msg = await UseDataService.messages({tableId: data.tableId, userId : bookingData.user_id });

          await UseDataService.sendNotification({
            notification: {
              senderId: data.userId,
              type: "Refund",
              message:  msg?.RefundSuccessMsg,
              receiverId: bookingData.user_id,
              followUser: null,
              tableId:  data.tableId,
              payOrderId: "",
              isPaid: true,
              templateId: "refund",
              roomName: "Refund_",
              creatorId: tableDetails?.created_by,
              status: 1, // approved
            },

            pushMessage: {
              title: "High Table",
              // message:  msg?.RefundSuccessMsg,
              payOrderId: '',  },
          });
        }
      } catch (error) {
        // Handle errors
        console.error(
          `Error occurred during refund for payment ID ${payId}:`,
          error
        );
        // Remove the idempotency key from the map in case of error
        idempotencyKeyMap.delete(payId);
        
        // Ensure creator_id is passed and use the correct bookingData for user_id
        const creator_id = data.userId;  // You may need to assign this value appropriately

        for (let bookingData of bookings) {
          await UseDataService.errorDataCreate({
            table_id: data.tableId,
            booking_id: bookingData.id,  // Correctly referencing bookingData.id
            booking_details: {payment_id : payId},
            user_id: bookingData.user_id, 
            creator_id, 
            error_type: 123456, 
            error_details: error.message || error // Ensure to store error details as a string
          });
        }

        console.log("=========== 112 112 112 112");
        throw new Error(error);
      }
    }
    return;
  } catch (error) {
    sails.log("Error Initiate refund",error)
    // throw new Error("Error fetching bookings: " + error.message);
  }
};
