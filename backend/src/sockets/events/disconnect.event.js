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
const removeTypingUser = function (socket, typingUsers) {
  const userId = socket.chatUserId.toString();
  console.log(userId);
  if (!userId) return;

  for (const [key, timeout] of typingUsers.entries()) {
    if (key.endsWith(`:${userId}`)) {

      const conversationId = key.split(":")[0];
      const roomId = `conversation:${conversationId}`;

      socket.to(roomId).emit("stop_typing", {
        conversationId,
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
