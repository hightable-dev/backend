// api/controllers/SmsController.js

const sendEncryptedSMS = require('../services/otpService');

module.exports = {
  sendSMS: async function(req, res) {
    try {
      const phoneNumber = req.param('phone');
      const response = await sendEncryptedSMS(phoneNumber);
      return res.json(response);
    } catch (error) {
      return res.serverError(error);
    }
  }
};


// api/controllers/SmsControllerV2.js

// const sdk = require('api')('@gupshup/v1.0#3wb1b43l4wp80pp');

// module.exports = {
//   sendSMS: async function (req, res) {
//     try {
//       const { userid, password, send_to, msg, method, msg_type, format, auth_scheme, v, otpCodeLength, otpCodeType } = req.allParams();

//       const options = {
//         userid,
//         password,
//         send_to,
//         msg,
//         method,
//         msg_type,
//         format,
//         auth_scheme,
//         v,
//         otpCodeLength,
//         otpCodeType
//       };

//       const response = await sdk.sendmessage(options);
//       return res.json(response.data);
//     } catch (error) {
//       return res.serverError(error);
//     }
//   }
// };
