const { payPending, bookingConfirmationPendingByCreator } = paymentStatusCode;

module.exports = async function (table_id) {
  
  const requiredFields = {
    table_id
  };

  // Collect missing fields dynamically
  const missingFields = Object.keys(requiredFields).filter(field => !requiredFields[field]);

  // If any fields are missing, throw an error with the dynamic message
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  try {
    const bookings = await TableBooking.findOne({
      table_id,
      status: { in: [payPending, bookingConfirmationPendingByCreator] }
    });
    return bookings;
  } catch (error) {
    throw new Error("Error fetching bookings: " + error.message);
  }
};
