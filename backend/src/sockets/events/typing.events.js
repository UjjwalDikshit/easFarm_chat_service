// typingUsers Map should live OUTSIDE the function

module.exports = function (io, socket,typingUsers) {

  const userId = socket.chatUserId.toString();

  /*
  ==========================================
  START TYPING
  ==========================================
  */

  socket.on("start_typing", ({ conversationId }) => {

    if (!conversationId) return;

    const roomId = `conversation:${conversationId}`;
    const key = `${conversationId}:${userId}`;

    if (!typingUsers.has(key)) {
      // Emit typing start only first time
      console.log('start typing called');
      
      socket.to(roomId).emit("start_typing", {
        conversationId,
        userId
      });

    }

    typingUsers.set(key, true);

  });

  /*
  ==========================================
  STOP TYPING (MANUAL)
  ==========================================
  */

  socket.on("stop_typing", ({ conversationId }) => {

    if (!conversationId) return;

    const roomId = `conversation:${conversationId}`;
    const key = `${conversationId}:${userId}`;

    if (typingUsers.has(key)) {
      typingUsers.delete(key);
      console.log('stopped typing called');
      socket.to(roomId).emit("stop_typing", {
        conversationId,
        userId
      });

    }
  });
};
