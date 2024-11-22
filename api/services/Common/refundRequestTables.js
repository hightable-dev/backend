 module.exports =  async function (data) {
  console.log("refundRequestTables 22222222222222222",{data});
    if (data && Array.isArray(data)) {
      const result = [];

      for (const item of data) {
        if (item.table_id) {
          // Update all records where table_id matches item.table_id
          const updatedBookings = await TableBooking.update({
              table_id: item.table_id,
              payment_id: item.payment_id,
            }).set({ status: refundRequest, status_glossary: "refundRequest" });
         

          result.push({ item, updatedBookings });

          await UseDataService.initiateRefund({
            userId: ProfileMemberId(request),
            tableId: parseInt(item.table_id),
          });
        } else {
          console.warn("mapBookedData - table_id not found for item:", item);
          continue; // Skip to the next item if table_id is not present
        }
      }
      return result;
    }
    return [];
  }