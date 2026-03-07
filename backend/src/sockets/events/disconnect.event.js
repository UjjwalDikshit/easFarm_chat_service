/*
==================================================
REMOVE ONLINE USER
==================================================
*/
const removeOnlineUser = function (io, socket, onlineUsers) {

  const userId = socket.user?._id?.toString();
  if (!userId) return;

  const userSockets = onlineUsers.get(userId);

  if (userSockets) {

    userSockets.delete(socket.id);

    // If no more active sockets → fully offline
    if (userSockets.size === 0) {

      onlineUsers.delete(userId);

      io.emit("user_offline", userId);

      console.log(`User ${userId} is offline`);
    }
  }
};


/*
==================================================
REMOVE TYPING USER
==================================================
*/
const removeTypingUser = function (io, socket, typingUsers) {

  const userId = socket.user?._id?.toString();
  if (!userId) return;

  for (const [key, timeout] of typingUsers.entries()) {

    if (key.endsWith(`_${userId}`)) {

      clearTimeout(timeout);

      const roomId = key.split("_")[0];

      socket.to(roomId).emit("typing:stop", {
        roomId,
        userId
      });

      typingUsers.delete(key);
    }
  }
};

module.exports = {
  removeOnlineUser,
  removeTypingUser
};