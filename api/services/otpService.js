const axios = require('axios');
const crypto = require('crypto');
const https = require('https');
require('dotenv').config();

const aesKey = Buffer.from('Pn5kTbM6lt4TXfr4SvjPikbBgB3xkSspgy3X5fEJoto', 'base64');

// Encrypt data using AES-256-GCM
function encryptData(data) {
    const iv = crypto.randomBytes(12); // Initialization vector (IV) for AES-256-GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv);

    let encryptedData = cipher.update(data, 'utf8', 'base64');
    encryptedData += cipher.final('base64');

    const tag = cipher.getAuthTag().toString('base64');

    return {
        iv: iv.toString('base64'),
        encryptedData: encryptedData,
        tag: tag
    };
}

async function sendEncryptedSMS(phone_no, message) {
    const apiUrl = 'https://enterprise.smsgupshup.com/GatewayAPI/rest';
    const userId = `${process.env.GUBSHUB_USERID}`; // Replace with your user ID
    const version = '1.1';
    const format = 'text';

    // Encrypting the parameters
    const encryptedData = encryptData(JSON.stringify({
        method: 'SendMessage',
        send_to: phone_no,
        msg: message,
        msg_type: 'TEXT',
        auth_scheme: 'plain',
        password: `${process.env.GUBSHUB_PASSWORD}`, // Replace with your password
        v: version,
        format: format
    }));

    try {
        const response = await axios.post(apiUrl, {
            userid: userId,
            encrdata: JSON.stringify(encryptedData)
        }, 
        {
            headers: {
                'Content-Type': 'application/json'
            },
            httpsAgent: new https.Agent({
                secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
            })
        }
        
        );

        return response.data;
    } catch (error) {
        console.error('Error sending SMS:', error);
        throw error;
    }
}

module.exports = sendEncryptedSMS;
