// /**
//  * @author mohan <mohan@studioq.co.in>
//  */

// /* global _, ProfileManagers /sails */

// module.exports = async function findOne(request, response) {
//   try {
//     var _response_object = {};

//     // Extract ID from request parameters
//     const { id } = request.params;

//     // Find table by ID
//     const specificTable = await TableBooking.findOne({ id });

//     // Check if table exists
//     if (!specificTable) {
//       return response.status(404).json({ error: 'Table not found' }); // Customize error message here
//     }

//     // Check if expiry date is passed
//     const currentDate = new Date();
//     if (specificTable.expiry_date < currentDate) {
//       // Update status to 6 if order is expired
//       await TableBooking.updateOne({ id }, { status: 6 });
      
//       return response.status(400).json({ message: 'Your booking expired' });
//     }

//     // Calculate total count of seats with status 5 or 9
//     const totalSeatsCount = await TableBooking.sum('seats', {
//       where: {
//         table_id: 91,
//         status: { in: [5, 9] } // Filter by status 5 or 9
//       }
//     });


//     // Update Tables model with the total booked seats count
//     await Tables.update({ id }).set({ booked_seats: totalSeatsCount });

//     // Continue the process if order is not expired
//     // Your further logic here...

//     // Send response
//     _response_object.message = 'Table retrieved successfully.';
//     _response_object.data = specificTable;

//     return response.status(200).json(_response_object);
//   } catch (error) {
//     console.error("Error occurred while fetching table:", error);
//     return response.status(500).json({ error: "Error occurred while fetching table" });
//   }
// }
