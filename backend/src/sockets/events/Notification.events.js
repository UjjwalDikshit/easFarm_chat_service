const Message = require("../../models/message");
const {conversation:Conversation} = require("../../models/conversation");

function registerNotificationEvents(io, socket) {
  const userId = socket.user._id;

  /*
  ==========================
  GET UNREAD COUNT
  ==========================
  */
  socket.on("notification:getUnreadCount", async (cb) => {
    try {
      const conversations = await Conversation.find({
        "participants.userId": userId
      });

      const conversationIds = conversations.map(c => c._id);

      const unreadCount = await Message.countDocuments({
        conversationId: { $in: conversationIds },
        readBy: { $ne: userId },
        senderId: { $ne: userId },
        deletedGlobally: false
      });

      cb({ success: true, unreadCount });
    } catch (err) {
      cb({ error: err.message });
    }
  });

  /*
  ==========================
  MARK CONVERSATION AS READ
  ==========================
  */
  socket.on("notification:markAsRead", async ({ conversationId }, cb) => {
    try {
      await Message.updateMany(
        {
          conversationId,
          readBy: { $ne: userId }
        },
        {
          $addToSet: { readBy: userId }
        }
      );

      cb({ success: true });

      io.to(conversationId).emit("notification:readUpdate", {
        conversationId,
        userId
      });
    } catch (err) {
      cb({ error: err.message });
    }
  });

  /*
  ==========================
  REALTIME MESSAGE NOTIFY
  ==========================
  */
  socket.on("notification:subscribe", () => {
    socket.join(`user:${userId}`);
  });
}

module.exports = registerNotificationEvents;