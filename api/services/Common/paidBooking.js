const { paymentSuccess } = paymentStatusCode;


module.exports = async function (id) {
  console.log("paidBookings tableId",id, "status",paymentSuccess)
    try {
      const bookings = await TableBooking.find({ table_id: id, status: paymentSuccess });
      return bookings;
    } catch (error) {
      throw new Error('Error fetching bookings: ' + error.message);
    }
  }