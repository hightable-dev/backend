
/**
 * Sends a push notification and creates a notification record in the database.
 * @author Dgs Mohan <[mohan@studioq.co.in]>
 * 
 * @function sendPushNotification
 * 
 * @param {Object} data - The data object containing necessary details for the notification.
 * @param {number} data.senderId - The ID of the sender.
 * @param {string} data.type - The type of notification (e.g., bookingReject, bookingAccept).
 * @param {string} data.message - The message to be sent (e.g., Booking rejected, Booking Accepted).
 * @param {number} data.receiverId - The ID of the receiver.
 * @param {number} data.tableId - The ID of the related table.
 * @param {string} data.payOrderId - The payment order ID (if applicable).
 * @param {boolean} data.isPaid - The payment status (0 for unpaid, 1 for paid).
 * @param {string} data.templateId - The template ID for the push message (e.g., bookingReject, bookingAccept). Used for frontend redirect to different screen
 * @param {string} data.roomName - The base name for the socket room (e.g., AcceptBooking_).
 * @param {number} data.creatorId - The ID of the creator (appended to the roomName).
 * @param {string} data.pushMsgTitle - The title of the table (used in the push notification).
 * @param {string} data.pushMessage - The message to be sent via push notification.
 * 
 * @returns {Promise<Object>} Returns the notification record created in the database.
 * 
 * @throws {Error} Throws an error if there is a problem sending the push notification or creating the database record.
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

module.exports = async function sendPushNotification(data) {
    async function sendPush(pushMsg, callback) {
        console.log('datadatadatadata', pushMsg, pushMsg?.data?.order_id);
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
                        orderDetails: pushMsg?.data?.order_id
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

    try {
        // Create the notification in the database
        const notification = await Notifications.create({
            sender: data?.senderId,
            type: data?.type,
            message: data?.message,
            receiver: data?.receiverId,
            table_id: data?.tableId ? data?.tableId : null,
            pay_order_id: data?.payOrderId,
            is_paid: data?.isPaid,
            follow_user: data?.followUser,
            template_id: data?.templateId,
            status: data?.status,
        });
        // Construct the socket room name
        let roomName = data?.roomName + data?.creatorId;
        socketService.notification(roomName, data);

        // Prepare the push notification data
        
        let push_data = {
            title: data?.pushMsgTitle,
            message: data?.pushMessage,
            player_ids: `user-${data.receiverId}`,
            data: {
                templateId: data?.templateId,
                id: data?.tableId,
                order_id: data?.payOrderId
            },
        };
        // Send the push notification
        await sendPush(push_data, function (response, error) {
            // await pushService.sendPush(push_data, function (response, error) {
            console.log("push_data", push_data)

            if (error) {
                sails.log.error('Push notification error:', error);
            } else {
                sails.log('Push notification sent successfully:', response);
            }
        });

        return notification;

    } catch (error) {
        sails.log.error('Error in sending notification:', error);
        throw error;
    }
};
