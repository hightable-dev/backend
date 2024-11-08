/**
 * Finds a single record in a PostgreSQL table based on the provided criteria using Sails ORM.
 *
 * @param {Object} data.criteria - The criteria to filter records.
 * @param {string} data.modelName - The name of the Sails model to query.
 * @returns {Promise<Object|null>} - A promise that resolves to the found record or null if no record is found.
 */
module.exports = async function (data) {
    console.log('Finding one record for model:', data.modelName, 'with criteria:', data.criteria);

    // Ensure the model exists
    const model = sails.models[data.modelName.toLowerCase()];
    console.log("model", model);
    if (!model) {
        throw new Error(`Model ${data.modelName} is not defined`);
    }

    try {
        // Perform the findOne query
        const foundRecord = await model.find(data.criteria);
        console.log('Found Record:', foundRecord); // Log the found record for debugging
        return foundRecord;
    } catch (error) {
        sails.log.error('Error executing findOne query', error);
        throw new Error('Error retrieving record from the database');
    }
};
