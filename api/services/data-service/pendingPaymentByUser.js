const { payPending, bookingConfirmationPendingByCreator } = paymentStatusCode;

module.exports = async function (data) {
  const { tableId, userId } = data;

  // Define required fields and their corresponding variable names
  const requiredFields = {
    tableId: 'tableId',
    userId: 'userId'
  };

  // Collect missing fields dynamically
  const missingFields = Object.keys(requiredFields).filter(field => !data[field]);

  // If any fields are missing, throw an error with the dynamic message
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  try {
    const bookings = await TableBooking.findOne({
      table_id: tableId,
      // order_id: data.orderId,
      user_id: userId,
      status: { in: [payPending, bookingConfirmationPendingByCreator] }
    });
    return bookings? bookings : null;
  } catch (error) {
    throw new Error("Error fetching bookings: " + error.message);
  }
};
