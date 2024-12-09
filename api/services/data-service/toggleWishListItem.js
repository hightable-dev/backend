module.exports = async function (data) {
  const {userId, tableId} = data ;
  // Define required fields and their corresponding variable names
  const requiredFields = {
    tableId: 'tableId',
    userId: 'userId',
  };

  // Collect missing fields dynamically
  const missingFields = Object.keys(requiredFields).filter(field => !eval(field));

  // If any fields are missing, throw an error with the dynamic message
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  try {
    const wishListedItem = await BookMarks.findOne({
      table_id: tableId,   // Use tableId directly
      user_id: userId,     // Use userId directly
    });

    return wishListedItem;

  } catch (error) {
    throw new Error("Error fetching tables: " + error.message);
  }
};
