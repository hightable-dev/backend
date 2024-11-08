const RazorpayService = require('../../services/RazorpayService');

// Map to store idempotency keys
const idempotencyKeyMap = new Map();

module.exports = async function userDestroy(request, response) {
  console.log("Destroy user");
  const { deletedAccountTables } = tableStatusCode;
  const { payPending, orderExpired, refundRequest, refundSuccess, paymentSuccess } = paymentStatusCode;

  // Define a function to process user profile and update it with user data
  async function updateUserProfile(idArray) {
    if (!Array.isArray(idArray) || idArray.length === 0) {
      throw new Error("idArray must be a non-empty array.");
    }

    const findUserProfile = await ProfileMembers.findOne({ account: idArray[0] });
    const findUser = await Users.findOne({ id: idArray[0] });

    if (!findUserProfile || !findUser) {
      throw new Error("User profile or user not found.");
    }

    await updateTables({ created_by: findUserProfile.id });

    findUserProfile.type = findUser.types;
    findUserProfile.deleted_user_id = findUserProfile.id;

    delete findUserProfile.id;

    return findUserProfile;
  }

  async function updateTables(data) {
    const findTables = await Tables.find(data);

    if (!findTables || findTables.length === 0) {
      throw new Error("There are no tables for this user.");
    }

    const updatedTables = await Promise.all(findTables.map(async (table) => {
      if (table.id) {
        const bookedList = await paidBooking(table.id);
        await requestRefund(bookedList)
          .then(result => console.log('Result:', result))
          .catch(error => console.error('Error:', error));

        return await Tables.updateOne({ id: table.id }).set({ status: deletedAccountTables });
      }
      return table;
    }));

    return updatedTables;
  }

  async function paidBooking(tableId) {
    try {
      const bookings = await TableBooking.find({ table_id: tableId, status: paymentSuccess });
      return bookings;
    } catch (error) {
      throw new Error('Error fetching bookings: ' + error.message);
    }
  }

  async function refundTablesList(tableId) {
    console.log("refundTablesList-tableId-79-function-start", tableId);
    try {
      const refundBookings = await TableBooking.find({ table_id: tableId, status: refundRequest });
      console.log('refundBookings 69', refundBookings)
      const paymentIds = refundBookings.map(booking => booking.payment_id);
      console.log('refundBookings paymentIds 71', paymentIds)

      if (!Array.isArray(paymentIds) || paymentIds.length === 0) {
        return response.status(400).json({ error: 'No valid payment IDs found.' });
      }

      const refundResponses = [];
      for (const payId of paymentIds) {
        console.log("payId", payId);

        if (idempotencyKeyMap.has(payId)) {
          console.log(`Refund request is already in progress for payment ID: ${payId}`);
          continue;
        }

        const idempotencyKey = RazorpayService.generateUniqueReceiptNumber(payId);
        idempotencyKeyMap.set(payId, idempotencyKey);

        try {
          const paymentDetails = await RazorpayService.instance.payments.fetch(payId);
          const actualAmountPaid = paymentDetails.amount;
          console.log("paymentDetails & actualAmountPaid", paymentDetails, actualAmountPaid);

          const refundResponse = await RazorpayService.instance.payments.refund(payId, {
            amount: actualAmountPaid,
            speed: 'normal',
            notes: {
              title: 'Table title here', // Changed to a placeholder since tableDetails is not defined yet
              description: 'Event was cancelled.'
            },
            receipt: RazorpayService.generateUniqueReceiptNumber(payId),
            idempotency_key: idempotencyKey
          });

          console.log("refundResponse 121", refundResponse);

          idempotencyKeyMap.delete(payId);

          await TableBooking.updateOne({ payment_id: payId }, { refund_details: refundResponse, status: refundSuccess });
          refundResponses.push(refundResponse);

          for (const data of refundBookings) {
            const tableDetails = await Tables.findOne({ id: data.table_id });
            const user = await Users.findOne({ profile_members: data.user_id });

            await notificationService({
              senderId: data.user_id,
              type: 'Refund',
              message: `Booking not accepted by the host for the ' ${tableDetails.title}'.`,
              receiverId: user?.profile_members,
              tableId: data.table_id,
              isPaid: false,
              templateId: 'refund',
              roomName: 'Refund_',
              creatorId: data.user_id,
              status: 1,
              pushMsgTitle: `'${tableDetails.title.charAt(0).toUpperCase()}${tableDetails.title.slice(1)}' was cancelled.`,
              pushMessage: `Refund initiated for the table '${tableDetails.title.charAt(0).toUpperCase()}${tableDetails.title.slice(1)}'.`
            });
          }

          console.log('refundResponse 149', refundResponse);
        } catch (error) {
          console.error(`Error occurred during refund for payment ID ${payId}:`, error);
          idempotencyKeyMap.delete(payId);
          return response.status(400).json({ error: error.message });
        }
      }

      return response.json(refundResponses);
    } catch (error) {
      throw new Error('Error fetching bookings: ' + error.message);
    }
  }

  async function requestRefund(data) {
    console.log("data 74", data);
    if (data && Array.isArray(data)) {
      const result = [];

      for (const item of data) {
        console.log("data 79 ", item);

        if (item.table_id) {
          await refundTablesList(item.table_id);

          const updatedBookings = await TableBooking.update({ table_id: item.table_id })
            .set({ status: refundRequest })
            .fetch();

          console.log('updatedBookings', updatedBookings);
          result.push({ item, updatedBookings });
        } else {
          console.warn('mapBookedData - table_id not found for item:', item);
        }
      }

      return result;
    }

    return [];
  }

  try {
    const { id } = request.body;
    let _response_object = {};

    if (!id) {
      return response.status(400).json({ error: "id is required." });
    }

    const idArray = Array.isArray(id) ? id : [id];

    const input_attributes = [{ name: 'id', min: 1 }];

    await new Promise((resolve, reject) => {
      validateModel.validate(null, input_attributes, { id: idArray }, (valid, errors) => {
        if (valid) {
          resolve();
        } else {
          reject(errors);
        }
      });
    });

    const updatedUserProfile = await updateUserProfile(idArray);
    console.log('Updated User Profile:', updatedUserProfile);

    const deletedUserData = await DeletedAccount.create(updatedUserProfile);
    console.log('Deleted User Data:', deletedUserData);

    await Users.destroy({ id: { in: idArray } });
    await ProfileMembers.destroy({ account: { in: idArray } });

    _response_object.message = 'Users and associated profile members destroyed successfully.';
    return response.status(200).json(_response_object);

  } catch (error) {
    console.error("Error occurred while destroying users and profile members:", error);
    return response.status(500).json({ error: "Error occurred while destroying users and profile members." });
  }
};
