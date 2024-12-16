module.exports = async (data) => {
    const {
        id, 
        table_id, 
        user_id, 
        creator_id, 
        status, 
        order_id, 
        payment_id
    } = data;

    try {
        // Dynamically build the criteria object
        const criteria = {};
        if (id) criteria.id = id;
        if (table_id) criteria.table_id = table_id;
        if (user_id) criteria.user_id = user_id;
        if (creator_id) criteria.creator_id = creator_id;
        if (status) criteria.status = status;
        if (order_id) criteria.order_id = order_id;
        if (payment_id) criteria.payment_id = payment_id;

        // Fetch bookings based on the criteria
        const bookings = await TableBooking.find(criteria);

        // Check if any bookings were found
        if (!bookings || bookings.length === 0) {
            throw new Error('No bookings found');
        }

        // Return the retrieved bookings
        return bookings;
    } catch (err) {
        console.error("Error fetching bookings:", err);
        throw err; // Pass the error to the caller
    }
};
