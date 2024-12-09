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
            throw new Error('Failed to fetch LinkedIn profile');
        }
    }
}

module.exports = LinkedInService;
