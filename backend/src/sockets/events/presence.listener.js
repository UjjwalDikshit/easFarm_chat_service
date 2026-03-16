const { sub } = require("../../config/redis");

module.exports = async function (io) {
  /*
  =============================
  USER ONLINE EVENT
  =============================
  */

  sub.subscribe("presence:online", async (message) => {
    try {
      const { userId } = JSON.parse(message);

      // notify only subscribers
      io.to(`presence:${userId}`).to(`user:${userId}`).emit("presence:update", {
        userId,
        online: true,
      });
    } catch (err) {
      console.error("presence:online listener error", err);
    }
  });

  /*
  =============================
  USER OFFLINE EVENT
  =============================
  */

  await sub.subscribe("presence:offline", async (message) => {
    try {
      const { userId } = JSON.parse(message);

      // notify only subscribers
      console.log("inside presence:offline");
      io.to(`presence:${userId}`).to(`user:${userId}`).emit("presence:update", {
        userId,
        online: false,
      });
    } catch (err) {
      console.error("presence:offline listener error", err);
    }
  });
};
