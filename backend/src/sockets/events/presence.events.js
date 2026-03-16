const { client: redis, pub } = require("../../config/redis");

module.exports = function (io, socket) {
  const userId = socket.chatUserId.toString();
  const redisKey = `presence:user:${userId}`;

  /*
  =============================
  USER CONNECTED
  =============================
  */

  (async () => {
    try {
      // add socket to redis set
      console.log("ADD SOCKET:", socket.id);
      await redis.sAdd(redisKey, socket.id);
      await redis.expire(redisKey, 60 * 60);

      const socketCount = await redis.sCard(redisKey);

      await redis.expire(redisKey, 60 * 60); // 1 hour safety

      // first active socket → user came online
      if (socketCount === 1) {
        await pub.publish("presence:online", JSON.stringify({ userId }));
      }
    } catch (err) {
      console.error("Presence connect error:", err);
    }
  })();

  /*
  =============================
  SUBSCRIBE TO USER PRESENCE
  =============================
  */

  socket.on("presence:subscribe", async ({ userId }) => {
    try {
      const room = `presence:${userId}`;

      socket.join(room);

      // send current state immediately
      const count = await redis.sCard(`presence:user:${userId}`);

      console.log(userId, { online: count > 0 });
      socket.emit("presence:update", {
        userId,
        online: count > 0,
      });
    } catch (err) {
      console.error("Presence subscribe error:", err);
    }
  });

  /*
  =============================
  UNSUBSCRIBE
  =============================
  */

  socket.on("presence:unsubscribe", ({ userId }) => {
    socket.leave(`presence:${userId}`);
  });

  /*
  =============================
  BULK PRESENCE CHECK
  =============================
  */

  socket.on("presence:check", async ({ userIds }) => {
    try {
      const pipeline = redis.multi();

      userIds.forEach((id) => {
        pipeline.sCard(`presence:user:${id}`);
      });

      const counts = await pipeline.exec();

      const result = userIds.map((id, i) => ({
        userId: id,
        online: counts[i] > 0
      }));

      socket.emit("presence:state", result);
    } catch (err) {
      console.error("Presence check error:", err);
    }
  });
};
