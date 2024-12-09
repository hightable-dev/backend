const axios = require('axios');
require('dotenv').config();

const apiKey = process.env.onesignal_api_key;
const appId = process.env.onesignal_app_id;

module.exports = {
  /**
   * Send notification via OneSignal.
   *
   * @param {Object} payload The data required to send the notification
   * @returns {Promise<Object>} The response from the OneSignal API
   */
  emailNotification: async function (payload) {
    const { custom_data, include_email_tokens, type } = payload;
    const url = 'https://onesignal.com/api/v1/notifications';

    if (!appId || !apiKey) {
      throw new Error('Missing OneSignal app ID or API key in environment variables');
    }

    let templateId;
    if (type === 'bookingEmailTemplate') {
      const { user_name, table_title, pay_id, amount } = custom_data ;

      if (!user_name || !table_title || !pay_id || !amount) {
        throw new Error('Missing user_name, table_title, pay_id, amount in custom data object');
      }

      templateId = '4d48f8ae-a71d-42f8-a4fb-e7550c970091'; // Booking template ID
      /* Sample Object
       {
          "type":"bookingEmailTemplate",
          "include_email_tokens": ["mohan@studioq.co.in"],
          "custom_data": { 
              "user_name": "Mohan ", 
              "table_title":"Abc xyz event", 
              "pay_id":"tested again", 
              "amount" : "2000000015"
          }
      }
      */
    } 
    
    if (type === 'refundEmailTemplate') {
       const { user_name, table_title, reference_id, refund_id,  amount } = custom_data ;

      if (!user_name || !table_title || !reference_id || !refund_id || !amount) {
        throw new Error('Missing user_name, table_title, pay_id, amount, refund_id  in custom data object');
      }

      templateId = 'acb81027-ca11-42b7-8063-fbb0f9f59d20'
      /* Sample Object  
       {
           "type":"refundEmailTemplate",
           "include_email_tokens": ["mohan@studioq.co.in"],
           "custom_data": { 
               "user_name": "Mohan ", 
               "table_title":"Abc xyz event", 
               "reference_id":"ref_56789",  // RRN NUMBER
               "refund_id" : "refund_123456"
               "amount" : "2000000015"
 
           }
       }
  */
    } else if (!type) {
      throw new Error('Missing type for the email template.');
    }

    // Construct the headers
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Basic ${apiKey}`, // Use correct header for OneSignal API key
    };

    // Construct the request body
    const body = {
      app_id: appId,
      ...(templateId && { template_id: templateId }),
      include_email_tokens: Array.isArray(include_email_tokens)
        ? include_email_tokens
        : [include_email_tokens], // Ensure tokens are in array format
      custom_data: custom_data || {},
    };

    try {
      const response = await axios.post(url, body, { headers });
      return response.data;
    } catch (error) {
      throw new Error(
        `Error sending notification via OneSignal: ${error.response?.data?.errors || error.message
        }`
      );
    }
  },
};