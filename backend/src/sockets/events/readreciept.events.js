const Message = require("../../models/message");
const Conversation = require("../../models/conversation");
const Group = require("../../models/conversation");

module.exports = function registerReadReceiptEvents(io, socket) {

  const readerId = socket.user._id.toString();

  socket.on("read", async (data, callback) => {
    try {

      const { type, conversationId, groupId } = data;

      if (!type) {
        return callback?.({ success: false, message: "Type is required" });
      }

      /*
      =====================================================
      1️⃣ PRIVATE CONVERSATION READ
      =====================================================
      */
      if (type === "conversation") {

        if (!conversationId) {
          return callback?.({ success: false, message: "conversationId required" });
        }

        // Validate membership
        const exists = await Conversation.exists({
          _id: conversationId,
          "participants.userId": readerId
        });

        if (!exists) {
          return callback?.({ success: false, message: "Not part of conversation" });
        }

        // Update unread messages directly
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

        // Reset unreadCount in Conversation
        await Conversation.updateOne(
          {
            _id: conversationId,
            "participants.userId": readerId
          },
          {
            $set: { "participants.$.unreadCount": 0 }
          }
        );

        // Emit once to room
        socket.to(conversationId).emit("conversation:read", {
          conversationId,
          readerId
        });

        return callback?.({
          success: true,
          readCount: result.modifiedCount
        });
      }

      /*
      =====================================================
      2️⃣ GROUP READ
      =====================================================
      */
      if (type === "group") {

        if (!groupId) {
          return callback?.({ success: false, message: "groupId required" });
        }

        const exists = await Group.exists({
          _id: groupId,
          "members.userId": readerId,
          "members.isRemoved": false
        });

        if (!exists) {
          return callback?.({ success: false, message: "Not a group member" });
        }

        const result = await Message.updateMany(
          {
            groupId,
            senderId: { $ne: readerId },
            readBy: { $ne: readerId },
            deletedGlobally: false
          },
          {
            $addToSet: { readBy: readerId }
          }
        );

        // Reset unreadCount in Group
        await Group.updateOne(
          {
            _id: groupId,
            "members.userId": readerId
          },
          {
            $set: { "members.$.unreadCount": 0 }
          }
        );

        socket.to(groupId).emit("group:read", {
          groupId,
          readerId
        });

        return callback?.({
          success: true,
          readCount: result.modifiedCount
        });
      }

    } catch (error) {
      console.error("Read receipt error:", error);
      callback?.({ success: false, message: "Failed to mark as read" });
    }
  });

};