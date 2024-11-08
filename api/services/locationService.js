// const fetch = require('node-fetch'); 

// async function extractLocationDetails(latitude, longitude) {
//   try {
    
//     const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyBT8eoAJTn-Ur4Mee378gd2URuko7BOzEM`);
//     const data = await response.json();

//     if (data.status === 'OK') {
//       const addressComponents = data.results[0].address_components;
//       let state = '';
//       let city = '';
//       let pincode = '';

//       for (const component of addressComponents) {
//         if (component.types.includes('administrative_area_level_1')) {
//           state = component.long_name;
//         } else if (component.types.includes('locality')) {
//           city = component.long_name;
//         } else if (component.types.includes('postal_code')) {
//           pincode = component.long_name;
//         }
//       }

//       return { state, city, pincode };
//     } else {
//       console.error('Error fetching location details:', data.error_message || 'Unknown error');
//       return { state: '', city: '', pincode: '' }; // Return default values or handle error as per your application logic
//     }
//   } catch (error) {
//     console.error('Error fetching location details:', error);
//     return { state: '', city: '', pincode: '' }; // Return default values or handle error as per your application logic
//   }
// }

// module.exports = { extractLocationDetails } ;
