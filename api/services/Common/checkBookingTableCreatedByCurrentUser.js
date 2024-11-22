module.exports = async function (data) {
  const { bookingId, userId  } = data;

  // Define required fields and their corresponding variable names
  const requiredFields = {
    bookingId: 'bookingId',
    userId : 'userId'
  };

  // Collect missing fields dynamically
  const missingFields = Object.keys(requiredFields).filter(field => !data[field]);

  // If any fields are missing, throw an error with the dynamic message
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  try {
    const bookingData = await TableBooking.findOne({
        id: bookingId, 
        creator_id:  userId // Use tableId directly after destructuring
      });
    
      if(bookingData){
        const { table_id, creator_id } = bookingData;
        const tableData = await Tables.find({
          id :table_id,   // Use tableId directly after destructuring
          created_by : creator_id     // Use userId directly after destructuring
        });
    
        return tableData.length > 0 ? true : null; //
      } else {
        if (!bookingData) {
          console.error('No data for the booking id.');
          return null
        }
      }
  
  } catch (error) {
    throw new Error("Error fetching tables: " + error.message);
  }
};
