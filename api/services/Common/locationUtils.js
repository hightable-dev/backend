const fetch = require('node-fetch');
require('dotenv').config();
const apiKey = process.env.GOOGLE_API_KEY

module.exports = {

    extractLocationDetails: async function (data) {
        console.log('dataxy', data)
        const { x, y } = data;
        try {
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${x},${y}&key=${apiKey}`);
            const data = await response.json();

            if (data.status === 'OK') {
                const addressComponents = data.results[0].address_components;
                let formattedAddress = data.results[0].formatted_address;
                // Remove any remaining numbers and slashes from the rest
                formattedAddress = formattedAddress.replace(/[0-9]+/g, '');
                // Optionally, replace multiple spaces with a single space and trim
                formattedAddress = formattedAddress.replace(/\s+/g, ' ').trim();
                // Remove any space before commas
                formattedAddress = formattedAddress.replace(/\s+,/g, ',');
                // Remove slash before string

                formattedAddress = formattedAddress.replace(/^[ ,]+/, '');
                formattedAddress = formattedAddress.replace(/^\/,?\s*/, '');
                // formattedAddress = formattedAddress.replace(/^,\s*/, ''); // Removes intiaial sapces 
                formattedAddress = formattedAddress.replace(/,,+/g, ',');

                formattedAddress = formattedAddress.replace(/[ ,]+$/, '');
                let state = '';
                let city = '';
                let pincode = '';
                let officialName = '';
                let district = '';
                let village = '';
                // console.log("addressComponents:::", JSON.stringify(addressComponents, null, 2));

                for (const component of addressComponents) {
                    // console.log("addressComponents:::component", JSON.stringify(component, null, 2));
                    // console.log("addressComponents:::component", JSON.stringify(component.types, null, 2));

                    if (component.types.includes('administrative_area_level_1')) {
                        state = component.long_name;
                    }
                    if (component.types.includes('locality')) {
                        city = component.long_name;
                    }
                    if (component.types.includes('postal_code')) {
                        pincode = component.long_name;
                    } 
                    if (component.types.includes('political')) {
                        officialName = component.long_name; // Official name (if available)
                    }
                    if (component.types.includes('administrative_area_level_3')) {
                        // console.log("administrative_area_level_3", true, component)
                        district =component.long_name
                    }
                }

                // if (!officialName) {
                //     officialName = city || state || '';
                // }

                return { state, city, pincode, formattedAddress, officialName, village, district };
            } else {
                console.error('Error fetching location details:', data.error_message || 'Unknown error');
                return { state: '', city: '', pincode: '' }; // Return default values or handle error as per your application logic
            }
        } catch (error) {
            console.error('Error fetching location details:', error);
            return { state: '', city: '', pincode: '' }; // Return default values or handle error as per your application logic
        }
    },

    geocodeLocation: async (locationName) => {
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationName)}&key=${apiKey}`;

        try {
            const response = await fetch(geocodeUrl);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Check if we have results
            if (data.status === "OK" && data.results.length > 0) {
                // Get the first result
                const { geometry } = data.results[0];
                const { lat, lng } = geometry.location;
                return { latitude: lat, longitude: lng }; // Return coordinates
            } else {
                console.log('No results found for the specified location.');
                return { latitude: null, longitude: null }; // Return null if no results
            }
        } catch (error) {
            console.error('Error:', error);
            return { latitude: null, longitude: null }; // Return null on error
        };
    },

    // getCityCoordinates: async function (cityName) {
    //     console.log('Fetching city info for:', cityName);

    //     try {
    //         const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cityName)}&key=${apiKey}`;

    //         // Fetch city coordinates using axios
    //         const response = await axios.get(url);

    //         if (response.data.status !== 'OK') {
    //             throw new Error('Unable to geocode city name');
    //         }

    //         const result = response.data.results[0];

    //         // Extract city information from the API response
    //         const cityInfo = {
    //             formattedAddress: result.formatted_address,
    //             location: result.geometry.location,  // Contains lat and lng
    //             placeId: result.place_id
    //         };

    //         console.log('City Info:', result, cityInfo);
    //         return cityInfo;

    //     } catch (err) {
    //         console.error('Error fetching city data:', err.message);
    //         throw err;  // Rethrow the error to handle it in the calling function
    //     }
    // }

}

