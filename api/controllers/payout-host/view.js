/**
 * @author mohan <mohan@studioq.co.in>
 */

/* global _, ProfileManagers /sails */

module.exports = async function findOne(request, response) {
  try {
    var _response_object = {};

    // Extract ID from request parameters
    const { id } = request.query;
    // Find user by ID
    // const specificUsers = await Users.find({ id }).limit(1); // Use .find().limit(1) instead of findOne()
    const payoutData = await PayoutHost.find({ id }).limit(1); // Use .find().limit(1) instead of findOne()

    // Check if user exists
    if (!payoutData || payoutData.length === 0) {
      return response.status(404).json({ error: 'Payout data not found' }); // Customize error message here
    }

    // Send response
    _response_object = {
      message: 'Payout status list retrieved.',
      details: payoutData
    }

    return response.ok(_response_object);
  } catch (error) {
    return response.status(500).json({ error: "Error occurred while fetching payout list" , details: error});
  }
}
