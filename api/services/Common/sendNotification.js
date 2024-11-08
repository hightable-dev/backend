
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

module.exports = async function sendPushNotification(data) {

    try {
        // Create the notification in the database
        const notification = await Notifications.create({
            sender: data?.notification?.senderId,
            type: data?.notification?.type,
            message: data?.notification?.message,
            receiver: data?.notification?.receiverId,
            table_id: data?.notification?.tableId ? data?.notification?.tableId : null,
            pay_order_id: data?.notification?.payOrderId,
            is_paid: data?.notification?.isPaid,
            follow_user: data?.notification?.followUser,
            template_id: data?.notification?.templateId,
            status: data?.notification?.status,
        });
        
        let roomName = data?.roomName + data?.creatorId;
        socketService.notification(roomName, data);

        // Prepare the push notification data
        let push_data = {
            title: data?.pushMessage.title,
            message: data?.pushMessage.message,
            player_ids: `user-${data?.notification?.receiverId}`,
            data: {
                templateId: data?.notification?.templateId,
                id: data?.notification?.tableId,
                order_id: data?.pushMessage?.payOrderId
            },
        };
        // Send the push notification
        await pushService.sendPush(push_data, function (response, error) {
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
