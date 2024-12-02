module.exports = async function (data) {
  const { tableId, userId   } = data;
console.log({tableId, userId})
  // Define required fields and their corresponding variable names
  const requiredFields = {
    tableId: 'tableId',
    userId: 'userId'
  };

  // Collect missing fields dynamically
  const missingFields = Object.keys(requiredFields).filter(field => !data[field]);

  // If any fields are missing, throw an error with the dynamic message
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  try {
    const tableData = await Tables.find({
      id: tableId,   // Use tableId directly after destructuring
      created_by: userId,     // Use userId directly after destructuring
    });
    return tableData.length > 0 ? true : null; //
  } catch (error) {
    throw new Error("Error fetching tables: " + error.message);
  }
};
