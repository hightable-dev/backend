const axios = require('axios');
const https = require('https');
const crypto = require('crypto');

module.exports = {
    async sendOTP(req, res) {
        try {
            const phone = req.query.phone_no;
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: `https://enterprise.smsgupshup.com/GatewayAPI/rest?userid=${process.env.GUBSHUB_USERID}&password=${process.env.GUBSHUB_USERID}&method=TWO_FACTOR_AUTH&v=1.1&phone_no=${phone}&msg=Use%20code%20%25code%25%20to%20log%20in%20to%20High%20Table%20App&format=text&otpCodeLength=4&otpCodeType=NUMERIC`,
                headers: {},
                httpsAgent: new https.Agent({
                    secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
                }),
            };
            const postresponse = await axios.request(config);
            return res.send(postresponse.data);
        } catch (error) {
            // Handle errors
            if (error.message.includes('SSL routines:final_renegotiate:unsafe legacy renegotiation disabled')) {
                return res.serverError({ error: 'SSL renegotiation error. Please try again later.' });
            } else {
                return res.serverError({ error: 'Internal Server Error' });
            }
        }
    },

    async verifyOTP(req, res) {
        try {
            const phone = req.query.phone_no;
            const otpCode = req.query.otp;
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: `https://enterprise.smsgupshup.com/GatewayAPI/rest?userid=${process.env.GUBSHUB_USERID}&password=${process.env.GUBSHUB_USERID}&method=TWO_FACTOR_AUTH&v=1.1&phone_no=${phone}&otp_code=${otpCode}`,
                headers: {},
                httpsAgent: new https.Agent({
                    secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
                }),
            };
            const verifyResponse = await axios.request(config);
            return res.send(verifyResponse);
        } catch (error) {
            // Handle errors
            if (error.message.includes('SSL routines:final_renegotiate:unsafe legacy renegotiation disabled')) {
                return res.serverError({ error: 'SSL renegotiation error. Please try again later.' });
            } else {
                return res.serverError({ error: 'Internal Server Error' });
            }
        }
    }
};
