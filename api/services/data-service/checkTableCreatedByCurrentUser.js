module.exports = async function (data) {
  const { tableId, userId   } = data;
  const requiredFields = {
    tableId: 'tableId',
    userId: 'userId'
  };

  // Collect missing fields dynamically
  const missingFields = Object.keys(requiredFields).filter(field => !data[field]);

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  try {
    const tableData = await Tables.find({
      id: tableId,  
      created_by: userId,  
    });
    return tableData.length > 0 ? true : null; //
  } catch (error) {
    throw new Error("Error fetching tables: " + error.message);
  }
};
