const { client: redis, pub } = require("../../config/redis");
/*
==================================================
REMOVE ONLINE USER
==================================================
*/
const removeOnlineUser = async function (socket) {
  const userId = socket.chatUserId.toString();
  if (!userId) return;
  const redisKey = `presence:user:${userId}`;
  await redis.sRem(redisKey, socket.id);
  console.log("REMOVE SOCKET:", socket.id);

  const socketCount = await redis.sCard(redisKey);
  console.log("Remaining sockets:", socketCount);

  if (socketCount === 0) {
    await redis.del(redisKey);

    console.log(`User ${userId} OFFLINE`);

    await pub.publish("presence:offline", JSON.stringify({ userId }));

    console.log(`User ${userId} is offline`);
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
        userId,
      });

      typingUsers.delete(key);
    }
  }
};

module.exports = {
  removeOnlineUser,
  removeTypingUser,
};
