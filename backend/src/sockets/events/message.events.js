const { createMessage } = require("../../services/message.services");
const { conversationMember,conversation } = require("../../models/conversation");

module.exports = function (io, socket) {

  socket.on("send_message", async (data, cb) => {
    try {

      const { type,content, conversationId } = data;
      const senderId = socket.user._id;// chatUserId

      if (!content) {
        return cb?.({ success: false, message: "Message content required" });
      }

      /*
      ==================================
      1️⃣ CREATE MESSAGE
      ==================================
      */
      const message = await createMessage({
        type,
        content,
        conversationId,
        senderId
      });

      await conversation.updateOne(
        { _id: conversationId },
        {
          lastMessageId: message._id,
          lastMessageAt: new Date()
        }
      );
      /*
      ==================================
      2️⃣ UPDATE UNREAD COUNT
      ==================================
      */

      await conversationMember.updateMany(
        {
          conversationId,
          userId: { $ne: senderId }
        },
        {
          $inc: { unreadCount: 1 }
        }
      );

      /*
      ==================================
      3️⃣ EMIT MESSAGE
      ==================================
      */

      socket.to(conversationId).emit("new_message", message);

      /*
      ==================================
      4️⃣ EMIT NOTIFICATION
      ==================================
      */

      socket.to(conversationId).emit("notification:newMessage", {
        conversationId,
        message
      });

      /*
      ==================================
      5️⃣ CALLBACK
      ==================================
      */

      cb?.({ success: true, message });

    } catch (error) {

      console.error("Message error:", error);

      cb?.({
        success: false,
        message: "Message failed"
      });

    }
  });

};