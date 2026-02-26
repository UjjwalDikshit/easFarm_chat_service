const removeOnlineUser = function (onlineUsers) {
  const userId = socket.userId;

  if (!userId) return;

  const userSockets = onlineUsers.get(userId);

  if (userSockets) {
    userSockets.delete(socket.id);

    // If no more active sockets → user is truly offline
    if (userSockets.size === 0) {
      onlineUsers.delete(userId);

      socket.broadcast.emit("user_offline", userId);

      console.log(`User ${userId} is offline`);
    }
  }
};

const removeTypingUser = function (typingUsers) {
  for (const [key, timeout] of typingUsers.entries()) {
    if (key.endsWith(`_${socket.userId}`)) {
      clearTimeout(timeout);

      const [groupId] = key.split("_");

      socket.to(groupId).emit("typing:stop", {
        groupId,
        userId: socket.userId,
      });

      typingUsers.delete(key);
    }
  }
};

module.exports = {removeOnlineUser,removeTypingUser};
