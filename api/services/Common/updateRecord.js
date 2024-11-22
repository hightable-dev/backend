/**
 * Updates records in a PostgreSQL table based on given data.matchCriteria and update data using Sails ORM.
 *
 * @param {Object} data.matchCriteria - The data.matchCriteria to filter which records to update.
 * @param {Object} data.values - The data to update in the matched records.
 * @param {string} data.modelName - The name of the Sails model to update.
 * @returns {Promise<number>} - A promise that resolves to the number of updated records.
 */
module.exports = async function (data) {
    // console.log('Updating records for model:', data.modelName, 'where matchCriteria:', data.matchCriteria, 'and update data:', data.values);
    // Ensure the model exists
    const model = sails.models[data.modelName.toLowerCase()];
    if (!model) {
        throw new Error(`Model ${data.modelName} is not defined`);
    }

    try {
        // Perform the update query
        const updatedRecords = await model.update(data.matchCriteria).set(data.values).fetch();
        return updatedRecords;
    } catch (error) {
        sails.log.error('Error executing update query', error);
        throw new Error('Error updating records in the database');
    }
};
