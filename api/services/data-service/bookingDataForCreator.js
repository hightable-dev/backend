module.exports = async function (data) {
    const { tableId, userId, status } = data;

    // Define required fields and their corresponding variable names
    const requiredFields = {
        tableId: 'tableId',
        userId: 'userId',
        status: 'status'
    };

    // Collect missing fields dynamically
    const missingFields = Object.keys(requiredFields).filter(field => !data[field]);

    // If any fields are missing, log an error and return a response
    if (missingFields.length > 0) {
        const errorMessage = `Missing required fields: ${missingFields.join(', ')}`;
        return { success: false, error: errorMessage }; // Return structured error response
    }

    try {
        const bookings = await TableBooking.find({
            table_id: tableId,
            creator_id: userId,
            status: { in: status }
        });

        return bookings ? bookings : [] ;// Return successful response
    } catch (error) {
        const errorMessage = "Error fetching bookings For: " + error.message;
        return { success: false, error: errorMessage }; // Return structured error response
    }
};
