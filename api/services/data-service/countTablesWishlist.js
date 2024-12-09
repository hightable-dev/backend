/**
 * Counts the number of records in a PostgreSQL table based on a given memberId and updates the table_count field in ProfileMembers.
 *
 * @param {number} memberId - The ID of the member to filter records.
 * @returns {Promise<number>} - A promise that resolves to the count of records.
 */
module.exports = async function (tableId) {
  const { bookmarkTable } = UseDataService;
  try {
    // Count the number of records created by the member that are not inactive

    if (tableId) {
      const totalTablesCount = await BookMarks.count({
        table_id: tableId,
        status: { 'in': [bookmarkTable] } // Ensure 'inactive' is a string
      });

      console.log({ totalTablesCount })

      // Update the table_count field in ProfileMembers
      await Tables.updateOne({
        id: tableId,
      }).set({ bookmarks: totalTablesCount });
    } else {
      sails.log.error("Tableid not recieved for wishlistCount");
      throw new Error("Tableid not recieved for wishlistCount");
    }
    // Return the total count
    // return totalTablesCount; // Return the count of records
  } catch (error) {
    sails.log.error("Error executing count wishlist query", error);
    // throw new Error("Error retrieving count from the database");
  }
};
