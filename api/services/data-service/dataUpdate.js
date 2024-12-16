module.exports = async function create(request, response, data) {
  const { modelName, matchCriteria,payloadData, filteredPostData, updatePayload } = data;

  // Send Response function
  const sendResponse = async (message, details) => {
    if (response.headersSent) return; // Exit if headers are already sent
    const updateResponse = {
      status:'success',
      message,
      details

    }
    response.ok(updateResponse); // Send a successful response
    return details; // Return the details
  };

  // Function to update data
  const updateData = async (matchCriteria, postData) => {
    try {
      // Check if data exists
      const existingData = await modelName.findOne(matchCriteria);
      if (!existingData) {
        throw ({status: 400, message: "No data found matching the criteria."});
      }

      // Update the data
      const updatedData = await modelName.updateOne(matchCriteria).set(postData);

      if (!updatedData) {
        throw new Error("Failed to update the data.");
      }

      // If the update is successful, send a response
      return await sendResponse("Data updated successfully.", updatedData);
    } catch (error) {
      throw error;
    }
  };

  // Validate model and proceed with update
  return new Promise((resolve, reject) => {
    validateModel.validate(
      modelName,
      payloadData,
      filteredPostData,
      async (valid, error) => {
        if (valid) {
          try {
            const result = await updateData(matchCriteria, updatePayload); // Process the update
            resolve(result); // Resolve with the result
          } catch (err) {
            reject(err); // Reject with an error
          }
        } else {
          const updateErrorDetails = {
            status: "error",
            message: "Validation error",
            details: error,
            count : error.length
          }

          // Send validation failure response
          if (!response.headersSent) {
            response.badRequest(updateErrorDetails);
          }
          
          reject(new Error("Validation failed."));
        }
      }
    );
  });
};
