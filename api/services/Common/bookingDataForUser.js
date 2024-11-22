
module.exports = async function (data) {
    console.log({"BOOKINGLISTFORUSER": data});
    const { tableId, userId, status } = data;

    // Define required fields and their corresponding types
    const requiredFields = {
        tableId: 'number',
        userId: 'number',
        status: 'array',
    };

    // Collect missing fields dynamically
    const missingFields = Object.keys(requiredFields).filter(field => {
        // Check for missing fields or wrong data types
        return !data[field] || typeof data[field] !== requiredFields[field];
    });

    // If any fields are missing or have wrong data types, throw an error with the dynamic message
    if (missingFields.length > 0) {
        throw new Error(`Missing or invalid fields: ${missingFields.join(', ')}`);
    }

    try {
        const bookings = await TableBooking.findOne({
            table_id: tableId,
            user_id: userId,
            status: { in: status },
        });
        return bookings; // Return bookings if found, otherwise null
    } catch (error) {
        throw new Error("Error fetching bookings: " + error.message);
    }
};
