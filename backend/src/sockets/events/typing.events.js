// typingUsers Map should live OUTSIDE the function
const typingUsers = new Map();

module.exports = function (io, socket) {

  const userId = socket.chatUserId.toString();

  /*
  ==========================================
  START TYPING
  ==========================================
  */

  socket.on("typing:start", ({ conversationId }) => {

    if (!conversationId) return;

    const roomId = `conversation:${conversationId}`;
    const key = `${conversationId}:${userId}`;

    // If already typing → reset timeout
    if (typingUsers.has(key)) {
      clearTimeout(typingUsers.get(key));
    } else {

      // Emit typing start only first time
      socket.to(roomId).emit("typing:start", {
        conversationId,
        userId
      });

    }

    // Auto stop typing after 3 seconds
    const timeout = setTimeout(() => {

      socket.to(roomId).emit("typing:stop", {
        conversationId,
        userId
      });

      typingUsers.delete(key);

    }, 3000);

    typingUsers.set(key, timeout);

  });

  /*
  ==========================================
  STOP TYPING (MANUAL)
  ==========================================
  */

  socket.on("typing:stop", ({ conversationId }) => {

    if (!conversationId) return;

    const roomId = `conversation:${conversationId}`;
    const key = `${conversationId}:${userId}`;

    if (typingUsers.has(key)) {

      clearTimeout(typingUsers.get(key));
      typingUsers.delete(key);

      socket.to(roomId).emit("typing:stop", {
        conversationId,
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

      if (key.endsWith(`:${userId}`)) {

        clearTimeout(timeout);

        const conversationId = key.split(":")[0];
        const roomId = `conversation:${conversationId}`;

        socket.to(roomId).emit("typing:stop", {
          conversationId,
          userId
        });

        typingUsers.delete(key);

      }

    }

  });

};
