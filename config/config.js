/**
 *
 * @author mohan<mohan@studioq.co.in>
 *
 */
require('dotenv').config()
//Overwrite these configuration in env/production.js for production enviroment
module.exports.conf = {
    google: {
        client_id: process.env.google_client_id,
        client_secret: process.env.google_api_key,
        api_key: process.env.google_api_key
    },
    apple: {
        client_id: process.env.apple_client_id,
        host_client_id: process.env.apple_host_client_id
    },
    aws: {
        region: process.env.aws_region,
        bucket_name: process.env.aws_bucket_name,
        access_key_id: process.env.aws_access_key_id,
        secret_access_key: process.env.aws_secret_access_key,
        endpoint: process.env.aws_endpoint
    },
    expo: {
        access_token: process.env.expo_access_token
    },
    webapp: process.env.webapp,
    razorpay: {
        key_id: process.env.razorpay_key_id,
        key_secret: process.env.razorpay_key_secret,
        // webhook_secret: process.env.PROD_razorpay_webhook_secret
    },
    sendgrid: {
        api_key: process.env.sendgrid_key
    },
    default_sender_email_id: process.env.default_sender_email_id,
    default_cc_email_id: process.env.default_cc_email_id,
    admin_email_id: process.env.admin_email_id,
    service_url: process.env.service_url,
    onesignal: {
        onesignal_api_key: process.env.onesignal_api_key,
        onesignal_app_id: process.env.onesignal_app_id
    }
};