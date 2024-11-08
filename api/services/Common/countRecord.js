/**
 * Counts the number of records in a PostgreSQL table based on a given data.criteria using Sails ORM.
 *
 * @param {Object} data.criteria - The data.criteria to filter records.
 * @param {string} data.modelName - The name of the Sails model to query.
 * @returns {Promise<number>} - A promise that resolves to the count of records.
 */
module.exports = async function (data) {
    console.log('Counting records for model:', data.modelName, 'with data.criteria:', data.criteria);

    // Ensure the model exists
    const model = sails.models[data.modelName.toLowerCase()];
    console.log("model", model)
    if (!model) {
        throw new Error(`Model ${data.modelName} is not defined`);
    }

    try {
        // Perform the count query
        const count = await model.count(data.criteria);
        console.log('Record Count:', count); // Log the count for debugging
        return count;
    } catch (error) {
        sails.log.error('Error executing count query', error);
        throw new Error('Error retrieving count from the database');
    }
};
