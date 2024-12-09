module.exports = async function (data) {
  const { table_id, booking_id, user_id, creator_id, type_glossary, error_details, booking_details, status_code, type } = data;
  const { razorpayErr } = UseDataService;
  // Define required fields and their corresponding variable names
  const requiredFields = {
    table_id: 'table_id',
    user_id: 'user_id',
    creator_id: 'creator_id',
    type: 'type',
    type_glossary: 'type_glossary',
    error_details: 'error_details'
  };

  // Collect missing fields dynamically
  const missingFields = Object.keys(requiredFields).filter(field => !data[field]);

  // If any fields are missing, throw an error with the dynamic message
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  try {
    /* 
    booking_details is order_id or payment_id any one these required

    */
    const issueCreatedAt = new Date();
    let description, statusCode;
    if (error_details?.error?.description) {
      description = error_details.error.description ? error_details.error.description : null;
    }

    if (error_details?.statusCode) {
      statusCode = error_details?.statusCode === 401 ? 1 : 0;
    }

    await ErrorDetail.create({
      table_id,
      type: statusCode ? razorpayErr : type,
      type_glossary: statusCode ? 'razorpayErr' : type_glossary,
      user_id,
      creator_id,
      booking_id: booking_id ? booking_id : 0,
      error_details,
      booking_details,
      issued_at: issueCreatedAt,
      status: status_code,
      description,
    });

  } catch (error) {
    throw new Error("Error creating error data: " + error);
  }
};
