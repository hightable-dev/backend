
const axios = require('axios');
const LinkedInService = require('../services/linkedInService'); // Adjust the path as needed
const linkedInService = new LinkedInService();
// const serviceUrl = `${ process.env.SERVICE_URL}`;
const clinet_id =process.env.LINKEDIN_CLIENT_ID; // Replace with your LinkedIn Client ID
const client_secret = process.env.LINKEDIN_CLIENT_SECRET; // Replace with your LinkedIn Client Secret
// const redirect_uri = `${serviceUrl}/auth/linkedin/callback`; // added '/' for redirect url
// const clinet_id = '860fe2e6oz6xbn'; // Replace with your LinkedIn Client ID
// const client_secret = 'fVlLjD6yUizL6tDb'; // Replace with your LinkedIn Client Secret
// const redirect_uri = `${serviceUrl}/auth/linkedin/callback`;
const redirect_uri = 'https://dev.hightable.ai/auth/linkedin/callback'

module.exports = {

  linkedin: function (res) {
    const responseType = 'code';
    const clientId = clinet_id; // Replace with your LinkedIn Client ID
    const redirectUri = redirect_uri;

    const state = shortid.generate(); // Generate a unique value for CSRF protection // own choice
    const scopes = ['openid', 'email', 'profile']; // Adjust scope as needed

    try {
      res.redirect(`https://www.linkedin.com/oauth/v2/authorization?response_type=${responseType}&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scopes}`);
    } catch (error) {
      res.status(500).send('Error redirecting to LinkedIn');
    }
  },

  linkedinCallback: async function (req, res) {
    const clientId = clinet_id; // Replace with your LinkedIn Client ID
    const clientSecret = client_secret;// Replace with your LinkedIn Client Secret
    const redirectUri = redirect_uri;

    const code = req.query.code;
    try {
      if (!code) {
        throw new Error('Authorization code is missing.');
      }

      const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
        params: {
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirectUri,
          client_id: clientId,
          client_secret: clientSecret,
        }
      });
      const accessToken = tokenResponse.data.access_token;
      let linkedInResponse = {
        access_token :accessToken,

      }

      if (!accessToken) {
        return res.badRequest('Access token is required');
      }

      if(accessToken){
        const profileData = await linkedInService.fetchMemberProfile(accessToken);
        linkedInResponse.prfile_data = profileData
      }

      res.json(linkedInResponse);
    } catch (error) {
      // Even if there's an error, send the access token in the response
      if (error.response?.data?.access_token) {

        res.json({ accessToken: error.response.data.access_token });
      } else {

        res.status(500).send('Error: Failed to fetch LinkedIn user data83');
      }
    }
  },


  async fetchLinkedInProfile(req, res) {
    try {
      const accessToken = req.body.accessToken; // Assuming the access token is in the request body

      if (!accessToken) {
        return res.badRequest('Access token is required');
      }

      const profileData = await linkedInService.fetchMemberProfile(accessToken);
      return res.json(profileData);
    } catch (error) {

      if (error.message.includes('ETIMEDOUT')) {
        return res.serverError('Request timed out. Please try again later.');
      }

      return res.serverError('Failed to fetch LinkedIn profile2');
    }
  }
};
