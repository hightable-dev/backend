module.exports = async function (req, tableId) {
    try {
        // Fetch booking status
        let tableBookingStatus = await TableBooking.findOne({
            user_id: ProfileMemberId(req),
            table_id: tableId
        }).select(['status']);

        // Fetch table details
        let bookingCloseStatus = await Tables.findOne({ id: tableId });
        const tableBookingClose = bookingCloseStatus.max_seats === bookingCloseStatus.booked;

        // console.log("BookingStatus141414", { tableBookingStatus, tableBookingClose, bookingCloseStatus });

        // Return both booking status and closed status
        return { tableBookingStatus, tableBookingClose };
    } catch (error) {
        console.error("Error fetching booking details:", error);
        throw error; // Rethrow to allow further handling if needed
    }
};
