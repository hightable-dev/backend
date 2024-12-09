// const { pending, approved, reject, bookingClosed, cancelled } = tableStatusCode;

module.exports = async function (id) {
  const {cancelled} = UseDataService ;
  
  try {
    // Find bookings with the specified table_id and update the status to 'cancelled'
    const updatedBookings = await BookMarks.update(
      { table_id: id } // Query condition
    ).set({ 
      status: cancelled // Set the status to 'cancelled'
    }).fetch(); // Use .fetch() to return the updated records

    // If no bookings were found, return a message
    if (updatedBookings.length === 0) {
      return 'No bookings found for the specified table ID.';
    }

    // Return the updated bookings
    return updatedBookings;

  } catch (error) {
    // Error handling with a descriptive message
    throw new Error("Error updating bookings: " + error.message);
  }
};
