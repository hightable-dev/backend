const idempotencyKeyMap = new Map();
const {
  refundRequest,
  refundSuccess,
} = paymentStatusCode;

module.exports = async function (data) {
  const { razorpayErr, createOrderErr, paymentErr, refundErr } = UseDataService;
  /**
   * @Param table id required
   * @Param user id required
   * */
  // let status_code ;
  try {
    const bookings = await TableBooking.find({
      table_id: data.tableId,
      status: refundRequest,
    });
    const tableDetails = await Tables.find({ id: data.tableId });

    const paymentIds = bookings.map((booking) => booking?.payment_id);
    const userIds = bookings.map((booking) => booking?.user_id);
    // Check if the paymentIds is an array
    if (!Array.isArray(paymentIds)) {
      throw new Error({ error: "paymentIds must be an array" });
    }

    const refundResponses = [];

    for (const payId of paymentIds) {
      // Check if the idempotency key for this payment ID exists
      if (idempotencyKeyMap.has(payId)) {
        // If idempotency key exists, skip this paymentIds
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
        const tableDetails = await Tables.findOne({ id: data.tableId });

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
        refundResponses.push(refundResponse);
        for (const bookingData of bookings) {
          await UseDataService.emailNotification(
            {
              // "type": "refundEmailTemplate",
              type: "refundEmailTemplate",
              // include_email_tokens: [bookingData?.user_details?.email],
              include_email_tokens: ['mohan@studioq.co.in'],
              custom_data: {
                "user_name": bookingData?.user_details?.first_name,
                "pay_id": 'paymentDetails?.id',
                table_title: bookingData?.table_details?.title,
                reference_id: refundResponse?.id,
                refund_id: refundResponse?.id,
                amount: bookingData?.amount
              }
            }
          );
        }



      } catch (error) {
        // Remove the idempotency key from the map in case of error
        idempotencyKeyMap.delete(payId);

        // Ensure creator_id is passed and use the correct bookingData for user_id
        // const creator_id = data.userId;  // You may need to assign this value appropriately

        // for (let bookingData of bookings) {
        //   await UseDataService.errorDataCreate({
        //     table_id: data.tableId,
        //     booking_id: bookingData.id,  // Correctly referencing bookingData.id
        //     booking_details: { payment_id: payId },
        //     user_id: bookingData.user_id,
        //     type: refundErr,
        //     type_glossary: 'refundErr',
        //     creator_id,
        //     error_details: error.message || error // Ensure to store error details as a string
        //   });
        // }

        throw error;
      }
    }



    userIds.forEach(async element => {
      // for (let userId of userIds) {
      const msg = await UseDataService.messages({ tableId: data.tableId, userId: element });

      await UseDataService.sendNotification({
        notification: {
          senderId: data.userId,
          type: "Refund",
          message: msg?.RefundSuccessMsg,
          receiverId: element,
          followUser: null,
          tableId: data.tableId,
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
          payOrderId: '',
        },
      });
      // }

    });
    return;
  } catch (error) {
    throw error;
    // throw new Error("Error fetching bookings: " + error.message);
  }
};
