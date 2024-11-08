/**
 * Filters an array of items based on a search term across multiple columns.
 *
 * @param {string} searchTerm - The term to search for within the columns of each item.
 * @param {Array<Object>} items - The array of items to search through.
 * @param {Array<string>} columns - The columns of each item to search within.
 * @returns {Array<Object>} - The filtered array of items where the search term is found in any specified column.
 */
module.exports = async function (searchTerm, items, columns) {
    if (!Array.isArray(items)) {
        throw new TypeError('Expected items to be an array');
    }
    // Trim trailing spaces from the searchTerm and convert to lowercase
    const trimmedSearchTerm = searchTerm.trim().toLowerCase();

    return items.filter(item => {
        return columns.some(column => {
            const value = item[column];
            if (typeof value === 'string') {
                // Trim trailing spaces and convert to lowercase
                const trimmedValue = value.trim().toLowerCase();
                if (trimmedValue.includes(trimmedSearchTerm)) {
                    return true;
                }
            }
            return false;
        });
    });
}

// Example usage
/**********************************
const items = [
    { title: 'Bangalore A', description: 'City of Gardens', city: 'Bangalore', address: '123 Bangalore St' },
    { title: 'Mumbai B', description: 'City that never sleeps', city: 'Mumbai', address: '456 Mumbai St' },
    { title: 'Chennai C', description: 'Gateway to South India', city: 'Chennai', address: '789 Chennai St' },
];

// Search term
const searchTerm = 'bangalore a ';

// Columns to search
const columns = ['title', 'description', 'city', 'address'];

// Calling the module function directly
(async () => {
    const searchResults = await module.exports(searchTerm, items, columns);
    console.log(searchResults);
})();

***********************************/

// Run this code
// node searchCriteria.js or  node searchCriteria