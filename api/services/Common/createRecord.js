/**
 * Creates a new record in a PostgreSQL table based on the provided data using Sails ORM.
 *
 * @param {Object} data.values - The data to create the new record.
 * @param {string} data.modelName - The name of the Sails model to query.
 * @returns {Promise<Object>} - A promise that resolves to the created record.
 */
module.exports = async function (data) {
  console.log('Creating record for model:', data.modelName, 'with values:', data.values);

  // Ensure the model exists
  const model = sails.models[data.modelName.toLowerCase()];
  console.log("model", model);
  if (!model) {
      throw new Error(`Model ${data.modelName} is not defined`);
  }

  try {
      // Perform the create query
      const createdRecord = await model.create(data.values).fetch();
      console.log('Created Record:', createdRecord); // Log the created record for debugging
      return createdRecord;
  } catch (error) {
      sails.log.error('Error executing create query', error);
      throw new Error('Error creating record in the database');
  }
};
