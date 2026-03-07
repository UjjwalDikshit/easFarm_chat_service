// typingUsers Map should live OUTSIDE the function (global per server)
const typingUsers = new Map();

module.exports = function (io, socket) {

  const userId = socket.user._id.toString();

  /*
  ==========================================
  START TYPING
  ==========================================
  */
  socket.on("typing:start", ({ groupId, conversationId }) => {

    const roomId = groupId || conversationId;
    if (!roomId) return;

    const key = `${roomId}_${userId}`;

    // If already typing, reset timeout only
    if (typingUsers.has(key)) {
      clearTimeout(typingUsers.get(key));
    } else {
      // Emit only first time
      socket.to(roomId).emit("typing:start", {
        roomId,
        userId
      });
    }

    // Auto stop after 3 seconds
    const timeout = setTimeout(() => {

      socket.to(roomId).emit("typing:stop", {
        roomId,
        userId
      });

      typingUsers.delete(key);

    }, 3000);

    typingUsers.set(key, timeout);
  });

  /*
  ==========================================
  STOP TYPING (Manual)
  ==========================================
  */
  socket.on("typing:stop", ({ groupId, conversationId }) => {

    const roomId = groupId || conversationId;
    if (!roomId) return;

    const key = `${roomId}_${userId}`;

    if (typingUsers.has(key)) {
      clearTimeout(typingUsers.get(key));
      typingUsers.delete(key);

      socket.to(roomId).emit("typing:stop", {
        roomId,
        userId
      });
    }
  });

  /*
  ==========================================
  CLEANUP ON DISCONNECT
  ==========================================
  */
  socket.on("disconnect", () => {

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
  });

};