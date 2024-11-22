/**
 * @author mohan <mohan@studioq.co.in>
 */

/* global _, ProfileManagers /sails */


module.exports = async function findOne(request, response) {
  try {
    var _response_object = {};

    // Extract ID from request parameters
    const { id } = request.params;

    // Find interest by ID
    const specificInterest = await findInterestById(id); // Dynamic ID from request parameters

    // Check if interest exists
    if (!specificInterest) {
      return response.status(404).json({ error: 'Interest not found' }); // Customize error message here
    }

    // Send response
    _response_object.message = 'Interest retrieved successfully.';
    _response_object.data = specificInterest;

    return response.status(200).json(_response_object);
  } catch (error) {
    console.error("Error occurred while fetching interest:", error);
    return response.status(500).json({ error: "Error occurred while fetching interest" });
  }
}

async function findInterestById(id) {
  // Find interest by ID
  const specificInterest = await Interests.findOne({ id: id }); // Dynamic ID passed as argument
  return specificInterest;
}
