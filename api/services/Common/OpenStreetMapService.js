// openstreetmapService.js

// Function to reverse geocode using OpenStreetMap
const reverseGeocode = async (latitude, longitude) => {
    const reverseGeocodeUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;

    try {
        const response = await fetch(reverseGeocodeUrl);
        
        // Check if the response is ok (status code 200)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data; // Return the address information
    } catch (error) {
        console.error('Error:', error);
        throw error; // Re-throw the error for further handling if needed
    }
};

// Export the function for use in other files
export default reverseGeocode;
