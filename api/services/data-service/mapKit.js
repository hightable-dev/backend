// api/services/MapService.js
// module.exports = {
//     getMapData: function(lat, lng) {
//         // Validate latitude and longitude
//         if (isNaN(lat) || isNaN(lng)) {
//             throw new Error('Invalid latitude or longitude');
//         }

//         // Return the map data
//         return {
//             latitude: lat,
//             longitude: lng,
//             zoom: 15, // You can customize this value or make it dynamic
//             title: "Location",
//             subtitle: `Lat: ${lat}, Lng: ${lng}`,
//         };
//     }
// };


// // api/services/MapService.js
require('dotenv').config();
module.exports = {

    getMapData: async (lat, lng) => {
        // console.log('service-map-kit', process.env.MAP_KIT_TOKEN)

        try {
            const response = await fetch(`/api/map?lat=${lat}&lng=${lng}`, {
                method: 'GET',
                headers: {
                    'Authorization': process.env.MAP_KIT_TOKEN // Replace with your actual access token
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error: ${errorData.error}`);
            }

            const data = await response.json();
            return data; // Return the data for further processing

        } catch (error) {
            console.error('Error fetching map data:', error.message);
            throw error; // Rethrow the error to be handled by the caller
        }
    }
};
