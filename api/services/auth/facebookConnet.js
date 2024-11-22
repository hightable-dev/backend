const FbService = require("../FbService");

module.exports = async function fbConnect(req, res) {
  // const token = req.body.token;
  // const token = req.query.token;
  const { token } = req.allParams();
  

  try {
    // Call the service to get Facebook data
    const fbData = await FbService.fetchUserData(token);

    // Send success response with the Facebook data
    return res.status(200).json({
      message: 'Facebook data retrieved successfully',
      data: fbData
    });

  } catch (error) {
    // Handle error and send error response
    return res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
};