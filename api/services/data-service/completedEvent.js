// const DataService = require("../DataService");

// const { paymentSuccess } = paymentStatusCode;
// const { eventStatusPending } = tableStatusCode;

module.exports = async function (id) {
  const {eventStatusPending, approved } = UseDataService ;

  try {
    // Fetch bookings where the status is 'paymentSuccess'
    const bookings = await Tables.find({ status: approved, booked: { '>': 0 } })

    // Check if there are any bookings returned
    if (bookings && bookings.length > 0) {
      const tableData = [];

      // Use for...of loop to handle async operations like database updates
      for (const booking of bookings) {
        const { id: tableId, event_date: eventDate, title, created_by } = booking;
        // Push table data for logging or further processing
        tableData.push({
          table_id: tableId,
          event_date: eventDate,
        });

        // Check if the event date is expired (compare with current date)
        if (new Date(eventDate) < new Date()) {
          // Update the status of the corresponding table to 'eventStatusPending'
          await Tables.update({ id: tableId })
            .set({ status: eventStatusPending });

            await UseDataService.sendNotification({
            notification: {
              senderId: created_by,
              type: 'eventCompleteStatus',
              message: `The table '${title} is now completed. You can ask the attendees to mark it as completed.`,
              receiverId: created_by,
              followUser: null,
              tableId,
              payOrderId: '',
              isPaid: true,
              templateId: 'eventCompleteStatus',
              roomName: 'EventComplete_',
              creatorId: created_by,
              status: 1,
            },
            pushMessage: {
              title: 'Event status',
            }
          });

        }
      }

      return tableData;
    } else {
      return [];
    }
  } catch (error) {
    throw new Error('Error fetching bookings: ' + error.message);
  }
};
