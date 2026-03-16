const Message = require("../../models/message");
const Conversation = require("../../models/conversation");

module.exports = function registerReadReceiptEvents(io, socket) {

  const readerId = socket.chatUserId.toString();

  socket.on("conversation:read", async ({ conversationId }, callback) => {

    try {

      if (!conversationId) {
        return callback?.({
          success: false,
          message: "conversationId required"
        });
      }

      /*
      ==========================================
      VALIDATE USER IS MEMBER
      ==========================================
      */

      const exists = await Conversation.exists({
        _id: conversationId
      });

      if (!exists) {
        return callback?.({
          success: false,
          message: "Conversation not found"
        });
      }

      /*
      ==========================================
      UPDATE MESSAGE READ STATUS
      ==========================================
      */

      const result = await Message.updateMany(
        {
          conversationId,
          senderId: { $ne: readerId },
          readBy: { $ne: readerId },
          deletedGlobally: false
        },
        {
          $addToSet: { readBy: readerId }
        }
      );

      /*
      ==========================================
      RESET UNREAD COUNT
      ==========================================
      */

      await Conversation.updateOne(
        {
          _id: conversationId,
          "participants.userId": readerId
        },
        {
          $set: { "participants.$.unreadCount": 0 }
        }
      );

      /*
      ==========================================
      EMIT READ EVENT
      ==========================================
      */

      io.to(`conversation:${conversationId}`).emit("conversation:read", {
        conversationId,
        readerId
      });

      callback?.({
        success: true,
        readCount: result.modifiedCount
      });

    } catch (error) {

      console.error("Read receipt error:", error);

      callback?.({
        success: false,
        message: "Failed to mark as read"
      });

    }

  });

};
