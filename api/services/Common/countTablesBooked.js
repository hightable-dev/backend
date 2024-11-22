/**
 * Counts the number of records in a PostgreSQL table based on a given memberId and updates the table_count field in ProfileMembers.
 *
 * @param {number} memberId - The ID of the member to filter records.
 * @returns {Promise<number>} - A promise that resolves to the count of records.
 */
module.exports = async function (memberId) {
    try {
      // Count the number of records created by the member that are not inactive
      const totalTablesCount = await TableBooking.count({
        user_id: memberId,
        status: 9 // Ensure 'inactive' is a string
      });
  
      // Update the table_count field in ProfileMembers
      await ProfileMembers.updateOne({
        id: memberId,
      }).set({ booked: totalTablesCount });
  
      // Return the total count
    //   return ; // Return the count of records
    } catch (error) {
      sails.log.error("Error executing count query", error);
      throw new Error("Error retrieving count from the database");
    }
  };
  