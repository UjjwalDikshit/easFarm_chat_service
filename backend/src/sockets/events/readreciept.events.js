const Message = require("../../models/message");
const { conversationMember } = require("../../models/conversation");

module.exports = function registerReadReceiptEvents(io, socket) {
  const readerId = socket.chatUserId.toString();

  socket.on("read_conversation", async (data, callback) => {
    try {
      console.log("inside read_conversation1");
      const { conversationId, lastMessageId } = data;

      if (!conversationId) {
        return callback?.({
          success: false,
          message: "conversationId required",
        });
      }

      /*
      ==========================================
      VALIDATE USER IS MEMBER
      ==========================================
      */

      const member = await conversationMember
        .findOne({
          conversationId,
          userId: readerId,
        })
        .select("_id lastReadMessageId");

      if (!member) {
        return callback?.({
          success: false,
          message: "Access denied",
        });
      }

      console.log("inside read_conversation1.2");
      /*
      ==========================================
      GET LAST MESSAGE (ONLY IF NOT PROVIDED)
      ==========================================
      */

      let latestMessageId = lastMessageId.toString() || null;

      if (!latestMessageId) {
        const lastMessage = await Message.findOne({
          conversationId,
          deletedGlobally: false,
        })
          .sort({ createdAt: -1 })
          .select("_id");

        latestMessageId = lastMessage?._id ||null;
      }

      if (!latestMessageId) {
        return callback?.({
          success: true,
          message: "No messages to mark as read",
        });
      }

      console.log("inside read_conversation2", lastMessageId);
      /*
      ==========================================
      AVOID UNNECESSARY UPDATE
      ==========================================
      */

      if (
        member.lastReadMessageId &&
        member.lastReadMessageId.toString() === latestMessageId.toString()
      ) {
        console.log("alerady up to date");
        return callback?.({
          success: true,
          message: "Already up to date",
        });
      }

      /*
      ==========================================
      UPDATE READ STATE (O(1))
      ==========================================
      */

      console.log("inside read_conversation3");
      await conversationMember.updateOne(
        {
          _id: member._id,
        },
        {
          $set: {
            lastReadMessageId: latestMessageId,
            unreadCount: 0,
          },
        },
      );

      /*
      ==========================================
      EMIT READ EVENT (FOR BLUE TICKS)
      ==========================================
      */
      console.log("inside read_conversation4");

      io.to(`conversation:${conversationId}`).emit("read_conversation", {
        conversationId,
        readerId,
        lastReadMessageId: latestMessageId.toString(), // ✅ FIX
      });

      callback?.({
        success: true,
      });
    } catch (error) {
      console.error("Read receipt error:", error);

      callback?.({
        success: false,
        message: "Failed to mark as read",
      });
    }
  });
};
