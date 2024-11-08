


const axios = require('axios');

const serviceUrl = process.env.SERVICE_URL;
const clinet_id = process.env.LINKEDIN_CLIENT_ID;
const client_secret = process.env.LINKEDIN_CLIENT_SECRET;
module.exports = async function list(request, response) {
    let request_query = request.allParams();
    const clientId = clinet_id;
    const clientSecret = client_secret;
    const code = request_query?.code

    try {
        if (!code) {
            throw new Error('Authorization code is missing.');
        }

        const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
            params: {
                grant_type: 'authorization_code',
                code: code,
                redirect_uri:'https://65.0.152.123/users/linkedinlogin',
                client_id: clientId,
                client_secret: clientSecret,
            }
        });

        const accessToken = tokenResponse.data.access_token;
        let redirect_url = `Hightable://LoginPageScreen?token=${accessToken}`;

        return response.redirect(redirect_url);

    } catch (error) {
        console.error('LinkedIn API Error:', error.response ? error.response.data : error.message);

        // Even if there's an error, send the access token in the response
        if (error.response && error.response.data && error.response.data.access_token) {
            response.json({ accessToken: error.response.data.access_token });
        } else {
            response.status(500).send(error);
        }
    }

};
