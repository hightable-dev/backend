/**
 * @author mohan <mohan@studioq.co.in>
 */

/* global _, ProfileManagers /sails */

module.exports = async function update(request, response) {
  const request_query = request.allParams();
  const filtered_query_data = _.pick(request_query, ["id"]);
  let { id : table_id } = filtered_query_data;
  const input_attributes = [
    { name: 'id', number: true, min: 1 },

  ];
  let _response_object = {};
  let bookingData;

  const {
    bookingCancelledByUser,
  } = paymentStatusCode;

  if (UserType(request) === roles.member) {
    bookingData = await UseDataService.pendingPaymentByUser({
      tableId: table_id,
      userId: ProfileMemberId(request),
    });
  }


  if (!bookingData) {
    return response
      .status(400)
      .json({ error: "There is no booking for the table" });
  }

  try {
    // Initialize validateModel function
    validateModel.validate(TableBooking, input_attributes, request.body, async function (valid, errors) {

      if (valid) {

        try {
          // Update data of the Tables
          const updatedTable = await TableBooking.updateOne({ id: bookingData.id }).set({ status: bookingCancelledByUser });

          // If the table is not found, return an appropriate response
          if (!updatedTable) {
            return response.status(404).json({ error: 'Table not found' });
          }

          // Build and send response with updated details
          _response_object.message = 'Booking cancelled.';
          return response.ok({ message: 'Table data updated successfully', details: updatedTable });
        } catch (error) {
          console.error('Error updating table data:', error);
          return response.status(500).json({ error: 'Error updating table data' });
        }
      } else {
        return response.status(400).json({ errors, count: errors.length });
      }
    });
  } catch (error) {
    console.error("Error occurred while updating Tables data:", error);
    response.status(500).json({ error: "Error occurred while updating Tables data" });
  }
};




