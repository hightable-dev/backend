/**
 * Finds records in the Interests model based on an array of IDs.
 *
 * @param {Array<number>} idsArray - The array of IDs to filter records.
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of interest names or an empty array if no records are found.
 */
module.exports = async function (idsArray) {
    try {
        // Check if idsArray is an array and not empty
        if (!Array.isArray(idsArray) || idsArray.length === 0) {
            throw new Error('Invalid array of IDs provided.');
        }

        // Perform the find query to retrieve records based on IDs
        const foundRecords = await Interests.find({
            id: idsArray // Filter by the array of IDs
        }).select(['name']); // Select only the 'name' field

        // Extract the names from the found records
        const interestNames = foundRecords.map(record => record.name);
console.log('interestNames',interestNames)
        // Return the array of names
        return interestNames;
    } catch (error) {
        sails.log.error('Error executing find query in Interests model', error);
        throw new Error('Error retrieving records from the database');
    }
};

// Explanation
// const idsArray = [40, 41, 42];
// const names = await sails.helpers.yourHelperFile(idsArray);
// console.log(names); // Output: ['Interest1', 'Interest2', 'Interest3']