const fetch = require('node-fetch');
require('dotenv').config();
const apiKey = process.env.GOOGLE_API_KEY

module.exports = {
  locationDetails: async function (data) {
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
        let detailedLocation = {};

        for (const component of addressComponents) {
          if (component.types.includes('sublocality_level_3')) {
            detailedLocation.sublocality_level_3 = component.long_name;
          }
          if (component.types.includes('sublocality_level_2')) {
            detailedLocation.sublocality_level_2 = component.long_name;
          }
          if (component.types.includes('sublocality_level_1')) {
            detailedLocation.sublocality_level_1 = component.long_name;
          }
          if (component.types.includes('locality')) {
            detailedLocation.locality = component.long_name;
          }
          if (component.types.includes('political')) {
            detailedLocation.political = component.long_name;
          }
          if (component.types.includes('administrative_area_level_3')) {
            detailedLocation.administrative_area_level_3 = component.long_name; // Official name (if available)
          }
          if (component.types.includes('administrative_area_level_2')) {
            detailedLocation.administrative_area_level_2 = component.long_name
          }
          if (component.types.includes('country')) {
            detailedLocation.country = component.long_name
          }

          if (component.types.includes('postal_code')) {
            detailedLocation.postal_code = component.long_name
          }
          if (component.types.includes('formatted_address')) {
            detailedLocation.formatted_address = component.long_name
          }
        }
        return { detailedLocation };

      } else {
        return { state: '', city: '', pincode: '' }; // Return default values or handle error as per your application logic
      }
    } catch (error) {
      return { state: '', city: '', pincode: '' }; // Return default values or handle error as per your application logic
    }
  },

  extractLocationDetails: async function (data) {
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

        for (const component of addressComponents) {

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
            district = component.long_name
          }
        }

        return { state, city, pincode, formattedAddress, officialName, village, district };
      } else {
        return { state: '', city: '', pincode: '' }; // Return default values or handle error as per your application logic
      }
    } catch (error) {
      throw error;
     
    }
  },

  fethGeoCodeDeatails: async (locationName) => {
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationName)}&key=${apiKey}`;

    try {
      const response = await fetch(geocodeUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Check if we have results
      if (data.status === "OK" && data.results.length > 0) {
        const addressComponents = data.results[0].address_components;
        // Extract and format into the desired location_details format
        const locationDetails = {
          country: extractComponent(addressComponents, "country"),
          locality: extractComponent(addressComponents, "locality"),
          sublocality_level_1: extractComponent(addressComponents, "sublocality_level_1"),
          sublocality_level_2: extractComponent(addressComponents, "sublocality_level_2"),
          political: extractComponent(addressComponents, "political"),
          postal_code: extractComponent(addressComponents, "postal_code"),
          administrative_area_level_3: extractComponent(addressComponents, "administrative_area_level_3"),
          administrative_area_level_2: extractComponent(addressComponents, "administrative_area_level_"),
          administrative_area_level_1: extractComponent(addressComponents, "administrative_area_level_1"),
        };

        return locationDetails; // Return formatted location details
      } else {
        return null; // Return null if no results
      }
    } catch (error) {

      return null; // Return null on error
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
        return { latitude: null, longitude: null }; // Return null if no results
      }
    } catch (error) {
      return { latitude: null, longitude: null }; // Return null on error
    };
  },
}

/**
 * Helper function to extract a specific component from address components.
 * @param {Array} components - The address components array from Google API.
 * @param {String} type - The type of the address component to extract.
 * @returns {String|null} - The long_name of the address component or null if not found.
 */

function extractComponent(components, type) {
  const component = components.find(comp => comp.types.includes(type));
  return component ? component.long_name : null;
}
