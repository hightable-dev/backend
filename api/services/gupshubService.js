const axios = require('axios');
const https = require('https');
const crypto = require('crypto');

exports.sendOTP = async function (phone, callback) {
    try {
        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `https://enterprise.smsgupshup.com/GatewayAPI/rest?userid=${process.env.GUBSHUB_USERID}&password=${process.env.GUBSHUB_PASSWORD}&method=TWO_FACTOR_AUTH&v=1.1&phone_no=${phone}&msg=Use%20code%20%25code%25%20to%20log%20in%20to%20High%20Table%20App&format=text&otpCodeLength=4&otpCodeType=NUMERIC`,
            headers: {},
            httpsAgent: new https.Agent({
                secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
            }),
        };
        console.log({config})

        const postresponse = await axios.request(config);

        console.log({postresponse})

        const responseData = postresponse.data;
        console.log({responseData})

        const parts = responseData.split('|').map(part => part.trim());

        const jsonObject = {
            status: parts[0],
            phone_no: parts[0] === 'success' ? parseInt(parts[1]) : phone,
            id: parts[0] === 'success' ? parts[2] : null,
            message: parts[0] === 'success' ? parts[3] : parts[2]
        };


        // Pass data to the callback function if provided
        if (callback) {
            callback(null, jsonObject);
        }
    } catch (error) {
        console.error('Error sending OTP:', error);
        // Pass error to the callback function if provided
        if (callback) {
            callback(error, null);
        }
    }
};

exports.verifyOTP = async function (phone, otp, callback) {
    try {
        const config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://enterprise.smsgupshup.com/GatewayAPI/rest?userid=${process.env.GUBSHUB_USERID}&password=${process.env.GUBSHUB_PASSWORD}&method=TWO_FACTOR_AUTH&v=1.1&phone_no=${phone}&otp_code=${otp}`,
            headers: {},
            httpsAgent: new https.Agent({
                secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
            }),
        };

        const postresponse = await axios.request(config);
        const responseData = postresponse.data;
        const parts = responseData.split('|').map(part => part.trim());

        const postresponsejsonObject = {
            status: parts[0],
            phone_no: parts[0] === 'success' ? parseInt(parts[1]) : phone,
            id: parts[0] === 'success' ? parts[2] : null,
            message: parts[0] === 'success' ? parts[3] : parts[2]
        };

        // Pass data to the callback function if provided
        if (callback) {
            callback(null, postresponsejsonObject);
        }

    } catch (error) {
        console.error('Error sending OTP:', error);
        // Pass error to the callback function if provided
        if (callback) {
            callback(error, null);
        }
    }
};
