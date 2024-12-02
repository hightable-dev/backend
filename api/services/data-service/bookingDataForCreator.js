module.exports = async function (data) {
    console.log("paidBookings tableId", data);
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
        console.error(errorMessage); // Log the error
        return { success: false, error: errorMessage }; // Return structured error response
    }

    try {
        const bookings = await TableBooking.find({
            table_id: tableId,
            creator_id: userId,
            status: { in: status }
        });

    /*     console.log("BOOKING DATA FOR CREATOR",{tableId,userId,bookings}) */

        return bookings ? bookings : [] ;// Return successful response
    } catch (error) {
        const errorMessage = "Error fetching bookings For: " + error.message;
        console.error(errorMessage); // Log the error
        return { success: false, error: errorMessage }; // Return structured error response
    }
};
