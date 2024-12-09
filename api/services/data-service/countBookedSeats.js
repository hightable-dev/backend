/**
 * Updates the booked_seats for a specific table based on successful payment statuses.
 * 
 * @param {number|string} tableId - The ID of the table to update.
 * @param {string|string[]} paymentSuccess - The status(es) to count as successful payments.
 */

module.exports =  async function (tableId, paymentSuccess) {
        try {
            // Calculate the total confirmed booked seats for the table
            const confirmedBookedSeats = await TableBooking.sum('seats').where({
                table_id: tableId,
                status: Array.isArray(paymentSuccess) ? paymentSuccess : [paymentSuccess]
            });

            // Update the booked_seats for the table
            await Tables.updateOne({ id: tableId }).set({ booked_seats: confirmedBookedSeats });
        } catch (error) {
            sails.log.error(`Error updating table seats for table ${tableId}:`, error);
            throw error;
        }
};
