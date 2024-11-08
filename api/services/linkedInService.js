// LinkedInService.js

const { RestliClient } = require('linkedin-api-client');
require('dotenv').config();

class LinkedInService {

    async fetchMemberProfile(accessToken) {
        try {
            const restliClient = new RestliClient();

            const response = await restliClient.get({
                resourcePath: '/userinfo',
                accessToken: accessToken // Use the provided accessToken
            });

            const profile = response.data;
            return profile;

        } catch (error) {
            // Enhanced error handling
            console.error('Error fetching LinkedIn profile:', error.response ? error.response.data : error.message);
            throw new Error('Failed to fetch LinkedIn profile');
        }
    }
}

module.exports = LinkedInService;
