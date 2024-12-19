/**
 *
 * @author sabarinathan <sabarinathan@studioq.co.in>
 *
 */

/* global _ */

/**
 * Return a unique identifier with the given `len`.
 *

 *
 * @param {Number} len
 * @return {String}
 * @api private
 */
const axios = require('axios');
const https = require('https');
const crypto = require('crypto');
let error_obj = new Error();

exports.findUser = async function (username, login_type, callback) {
  try {

    let encrypted_phone

    if (login_type === 'phone') {
      if (!_.isNaN(Number(username))) {

        await phoneEncryptor.encrypt(username, function (encrypted_text) {
          encrypted_phone = encrypted_text;
        });
      }
    } else {
      encrypted_phone = username
    }
    const query = `
      SELECT
      "id",
      "username",
      "password",
      "status",
      "status_glossary",
      "last_active",
      "tokens",
      "types",
      "updated_at"
      FROM "hightable_users"
      WHERE $1 = ANY(username::text[])
    `;

    let queryData = [encrypted_phone];

    // Executing query
    var user_model = sails.sendNativeQuery(query.toString(), queryData);
    user_model.exec(function (err, user) {
      if (err) {
        error_obj.status = 404;
        if (err.message) {
          error_obj.message = err.message;
        } else {
          error_obj.message = 'Something went wrong.';
        }
        return callback(error_obj);
      } else if (user && user.rowCount > 0) {

        return callback(err, user['rows'][0]);
      } else {
        error_obj = {
          status: 404,
          message: 'No user found.',
          is_user_exist: false
        }
        return callback(error_obj);
      }
    });
  } catch (err) {
    if (err.message) {
      error_obj.message = err.message;
    } else {
      error_obj.message = 'Something went wrong.';
    }
    return callback(error_obj);
  }
};

exports.findExistingConnection = async function (source_type, email, phone, callback) {

  try {
    var whereClause = {};
    if (email) {
      whereClause.email = email;
    }
    if (phone) {
      whereClause.phone = await phoneEncryptor.encrypt(phone);
    }
    const user = await Users.findOne({
      email
    });

    if (user) {
      return callback(null, user);
    } else {

      return callback(null, null);
    }
  } catch (error) {
    return callback(error);
  }
};

exports.findUserByToken = function (access_token, callback) {

  try {
    // Building query
    var query = "SELECT ";
    var account_fields = _.without(Object.keys(Users.schema), 'username', 'password');
    var token_fields = _.without(Object.keys(AccessTokens.schema));

    // Add account fields to SELECT statement
    account_fields.forEach(function (value) {
      if (Users.schema[value].columnName || typeof Users.schema[value].columnName !== "undefined") {
        query += Users.tableAlias + "." + Users.schema[value].columnName + ", ";
      }
    });

    // Add token fields to SELECT statement
    query += "json_build_object(";
    token_fields.forEach(function (value) {
      if (AccessTokens.schema[value].columnName || typeof AccessTokens.schema[value].columnName !== "undefined") {
        query += "'" + AccessTokens.schema[value].columnName + "', " + AccessTokens.tableAlias + "." + AccessTokens.schema[value].columnName + ", ";
      }
    });
    query = query.slice(0, -2);
    query += ") AS token ";

    // Add table names and JOIN conditions
    query += "FROM " + AccessTokens.tableName + " AS " + AccessTokens.tableAlias;
    query += " JOIN " + Clients.tableName + " AS " + Clients.tableAlias + " ON " + AccessTokens.tableAlias + "." + AccessTokens.schema.client_id.columnName + " = " + Clients.tableAlias + "." + Clients.schema.client_id.columnName;
    query += " JOIN " + Users.tableName + " AS " + Users.tableAlias + " ON " + AccessTokens.tableAlias + "." + AccessTokens.schema.user_id.columnName + " = " + Users.tableAlias + "." + Users.schema.id.columnName;

    // Add WHERE condition
    query += " WHERE " + AccessTokens.tableAlias + "." + AccessTokens.schema.token.columnName + "='" + access_token + "'";
    //Executing query
    var token_model = sails.sendNativeQuery(query);
    token_model.exec(function (err, user) {
      if (err) {
        if (err.message) {
          error_obj.message = err.message;
        } else {
          error_obj.message = 'Something went wrong.';
        }
        return callback(error_obj);
      } else if (user && user.rowCount > 0) {
        return callback(err, user['rows'][0]);
      } else {
        error_obj = {
          message: 'No user found with given token.',
          is_user_exist: false
        }
        return callback(error_obj);
      }
    });
  } catch (err) {
    if (err.message) {
      error_obj.message = err.message;
    } else {
      error_obj.message = 'Something went wrong.';
    }
    return callback(error_obj);
  }
};


exports.sendOTP = async function (phone, callback) {
  const demoUser = "9999912345";
  const demoUser1 = "9876543211";
  const demoUser2 = "9876543212";
  const demoUser3 = "9876543213";
  const demoUser4 = "9876543214";
  const demoUser5 = "9876543215";
  // Check if the phone number is not equal to demoUser or demoUser2
  if (phone !== demoUser && phone !== demoUser1 && phone !== demoUser2 && phone !== demoUser3 && phone !== demoUser5 && phone !== demoUser5) {
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

      const postresponse = await axios.request(config);
      const responseData = postresponse.data;
      const parts = responseData.split('|').map(part => part.trim());

      const jsonObject = {
        status: parts[0],
        phone_no: parts[0] === 'success' ? parseInt(parts[1]) : phone,
        id: parts[0] === 'success' ? parts[2] : null,
        message: parts[0] === 'success' ? parts[3] : parts[2]
      };

      // Pass data to the callback function
      if (typeof callback === 'function') {
        callback(null, jsonObject);
      }
    } catch (error) {
      // Pass error to the callback function
      if (typeof callback === 'function') {
        callback(error);
      }
    }
  }
  else {
    jsonObject = {
      status: 'success',
      phone_no: phone,
      message: 'Your OTP is 7799'
    };

    callback(null, jsonObject);
  }
}



exports.verifyOTP = async function (phone, otp, callback) {
  const demoUser = "9999912345";
  const demoUser1 = "9876543211";
  const demoUser2 = "9876543212";
  const demoUser3 = "9876543213";
  const demoUser4 = "9876543214";
  const demoUser5 = "9876543215";
  const demoUserOtp = "7799";
  if ((phone === demoUser || phone === demoUser1 || phone === demoUser2 || phone === demoUser3 || phone === demoUser4 || phone === demoUser5) && otp === demoUserOtp) {
    jsonObject = {
      status: 'success',
      phone_no: phone,
      message: 'Your OTP is 7799'
    };

    callback(null, jsonObject);
  } else {
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
      // Handle the response
      // Pass data to the callback function
      callback(null, postresponsejsonObject);
    } catch (error) {
      // Pass error to the callback function
      callback(error);
    }
  }
}