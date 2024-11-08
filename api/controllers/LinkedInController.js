
const axios = require('axios');
const LinkedInService = require('../services/linkedInService'); // Adjust the path as needed
const linkedInService = new LinkedInService();
const serviceUrl = `${ process.env.SERVICE_URL}`;
const clinet_id =process.env.LINKEDIN_CLIENT_ID; // Replace with your LinkedIn Client ID
const client_secret = process.env.LINKEDIN_CLIENT_SECRET; // Replace with your LinkedIn Client Secret
// const redirect_uri = `${serviceUrl}/auth/linkedin/callback`; // added '/' for redirect url
// const clinet_id = '860fe2e6oz6xbn'; // Replace with your LinkedIn Client ID
// const client_secret = 'fVlLjD6yUizL6tDb'; // Replace with your LinkedIn Client Secret
const redirect_uri = `${serviceUrl}/auth/linkedin/callback`;
// console.log("lin-credet",clinet_id,client_secret)

module.exports = {

  linkedin: async function (req, res) {
    const responseType = 'code';
    const clientId = clinet_id; // Replace with your LinkedIn Client ID
    const redirectUri = redirect_uri;
    const state = shortid.generate(); // Generate a unique value for CSRF protection // own choice
    const scopes = ['openid', 'email', 'profile']; // Adjust scope as needed

    try {
      res.redirect(`https://www.linkedin.com/oauth/v2/authorization?response_type=${responseType}&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scopes}`);
    } catch (error) {
      console.error('Error redirecting to LinkedIn:', error);
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

      if (!accessToken) {
        return res.badRequest('Access token is required');
      }

      if(accessToken){
        const profileData = await linkedInService.fetchMemberProfile(accessToken);
        console.log('profileData',profileData)
      }

      res.json({ accessToken });
    } catch (error) {
      console.error('LinkedIn API Error:', error.response ? error.response.data : error.message);
      // Even if there's an error, send the access token in the response
      if (error.response && error.response.data && error.response.data.access_token) {
        res.json({ accessToken: error.response.data.access_token });
      } else {
        res.status(500).send('Error: Failed to fetch LinkedIn user data');
      }
    }
  },


  async fetchLinkedInProfile(req, res) {
    console.log("Request body:", req.body);
    try {
      const accessToken = req.body.accessToken; // Assuming the access token is in the request body
      console.log("Access token in request body:", accessToken);

      if (!accessToken) {
        return res.badRequest('Access token is required');
      }

      const profileData = await linkedInService.fetchMemberProfile(accessToken);
      return res.json(profileData);
    } catch (error) {
      console.error('Error fetching LinkedIn profile:', error);

      if (error.message.includes('ETIMEDOUT')) {
        return res.serverError('Request timed out. Please try again later.');
      }

      return res.serverError('Failed to fetch LinkedIn profile');
    }
  }
};
