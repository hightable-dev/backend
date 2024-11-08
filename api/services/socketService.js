exports.send = function (ids, event_name, data) {
  var io = sails.io;
  io.on('connection', (socket) => {
    socket.on('initializeData', (data) => {
      // Process the received data on the server
    });
  });

  // sails.sockets.join(ids, event_name);
  sails.sockets.broadcast(ids, event_name, data);
};

exports.connect = function (roomName, notificationData) {

  var io = sails.io;

  io.on('connection', function (socket) {
    socket.join(roomName); // You can change 'room1' to any room name you prefer

    // Emitting notification to all clients in the room
    io.to(roomName).emit('notification_' + notificationData?.user, notificationData);

  });

  return;
}
exports.connectAndJoinRoom = function (roomName) {
  // Assuming `sails` and `io` are defined elsewhere
  var io = sails.io;


  // Joining the room
  sails.io.on('connection', function (socket) {
    socket.join(roomName); // Join the specified room
  });
  return;
};


exports.emitNotification = function (roomName, notificationData) {
  var io = sails.io;
  // Emitting notification to all clients in the room
  io.to(roomName).emit('notification_' + roomName, notificationData);
  return;
};


exports.notification = async function (roomName, notificationData) {
  var io = sails.io;
  try {
    const query = {
      text: 'SELECT COUNT(*) AS count FROM hightable_notification WHERE receiver = $1 AND read = $2',
      values: [notificationData?.user, false],
    };
    const result = await Notifications.getDatastore().sendNativeQuery(query.text, query.values);
    const count = result?.rows[0]?.count || 0;

    // sails.sockets.broadcast(roomName, `notification_${notificationData?.user}`, count);
    io.on('connection', function (socket) {
      socket.join(roomName);
      io.to(roomName).emit(`notification_${notificationData?.user}`, count);
      // io.sockets.in(roomName).emit(`notification_${notificationData?.user}`, count);
    });
  } catch (error) {
    console.error("Error while emitting notification:", error);
  }
};




