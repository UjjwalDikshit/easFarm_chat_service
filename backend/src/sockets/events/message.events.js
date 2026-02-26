const { createMessage } = require("../../services/message.services");

module.exports = function (io, socket) {
  socket.on("send_message", async (data) => {
    try {
      const message = await createMessage({
        content: data.content,
        groupId: data.groupId,
        conversationId: data.conversationId,
        senderId: socket.userId,
      });
      io.to(data.groupId).emit("new_message", message);
    } catch (error) {
      console.error("Message error:", error);
    }
  });
};
