const { createMessage } = require("../../services/message.services");
const {
  conversationMember,
  conversation,
} = require("../../models/conversation");
const { isObjectIdOrHexString, toObject } = require("mongoose");
const { insertOne } = require("../../models/invite_link");

module.exports = function (io, socket) {
  socket.on("send_message", async (data, cb) => {
    try {
      const { type, content, conversationId, clientId } = data;
      const senderId = socket.user._id; // chatUserId
      const uniqueId = socket.user.uniqueId;
      console.log(socket.user);

      if (!content) {
        return cb?.({ success: false, message: "Message content required" });
      }

      /*
    ==================================
    0️ FETCH CONVERSATION + VALIDATION
    ==================================
    */

      const convo = await conversation.findById(conversationId);

      if (!convo) {
        return cb?.({
          success: false,
          message: "Conversation not found",
        });
      }

      /*
     BLOCK CHECK (THIS IS WHERE IT GOES)
    */
      if (convo.type === "private" && convo.isBlocked) {
        return cb?.({
          success: false,
          message: "Conversation is blocked",
        });
      }

      /*
    OPTIONAL: Ensure sender is member
    */
      const isMember = await conversationMember.findOne({
        conversationId,
        userId: senderId,
      });

      if (!isMember) {
        return cb?.({
          success: false,
          message: "Not part of this conversation",
        });
      }
      /*
      ==================================
      1️ CREATE MESSAGE
      ==================================
      */
      const message = await createMessage({
        type,
        content,
        conversationId,
        senderId,
        uniqueId, 
      });

      await conversation.updateOne(
        { _id: conversationId },
        {
          lastMessageId: message._id,
          lastMessageAt: message.createdAt,
        },
      );
      /*
      ==================================
      2️ UPDATE UNREAD COUNT
      ==================================
      */

      await conversationMember.updateMany(
        {
          conversationId,
          userId: { $ne: senderId },
        },
        {
          $inc: { unreadCount: 1 },
        },
      );

      /*
      ==================================
      3️ EMIT MESSAGE
      ==================================
      */

      socket.to(`conversation:${conversationId}`).emit("new_message", message);

      /*
      ==================================
      4️ EMIT NOTIFICATION
      ==================================
      */

      socket
        .to(`conversation:${conversationId}`)
        .emit("notification:newMessage", {
          conversationId,
          message,
          clientId,
        });

      /*
      ==================================
      5️ CALLBACK
      ==================================
      */

      cb?.({ success: true, message, clientId });
    } catch (error) {
      console.error("Message error:", error);

      cb?.({
        success: false,
        message: "Message failed",
      });
    }
  });
};
