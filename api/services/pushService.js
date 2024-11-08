/**
 *
 * @author mohan<mohan@studioq.co.in>
 *
 */

/* global _ */

/**
 *
 * @param {Number} len
 * @return {String}
 * @api private
 */


require('dotenv').config();
const request = require("request");
const OneSignal = require('onesignal-node');
const { default: axios } = require('axios');
const { datacatalog_v1beta1 } = require('googleapis');
const onesignal_app_auth_key = process.env.onesignal_api_key;
const onesignal_app_id = process.env.onesignal_app_id;
const BASE_URL = process.env.service_url;
const onesignal_client = new OneSignal.Client({
  app: { appAuthKey: onesignal_app_auth_key, appId: onesignal_app_id }
});

exports.sendPush = async function sendPush(pushMsg, callback) {
  // var notification = {
  //   app_id: onesignal_app_id,
  //   headings: { "en": data.title },
  //   contents: { "en": data.message },
  //   include_player_ids: [data?.player_ids],

  //   data: {
  //     templateId: data.data.templateId,
  //     // id: data.data.id,
  //     // uuId: data.data.uu_id
  //   },
  // };


  // onesignal_client.createNotification(notification).then(function (response) {



  //   // return callback(response);
  // }).catch(function (error) {

  // });
  console.log('datadatadatadata',pushMsg, pushMsg?.data?.order_id);
  try {
    const datas = await axios.post(
      'https://onesignal.com/api/v1/notifications',
      {
        app_id: onesignal_app_id,
        headings: { "en": pushMsg.title },
        contents: { "en": pushMsg.message },
        include_external_user_ids: [pushMsg?.player_ids],
        data: {
          templateId: pushMsg.data.templateId,
          id: pushMsg.data.id,
          /*order_id will receive when boooking a table*/ 
          orderDetails:pushMsg?.data?.order_id
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${onesignal_app_auth_key}`
        }
      }
    );
    
    callback(datas, null);
  } catch (error) {
    console.error('Error sending notification:', error);
    callback(null, error);
  }
};

