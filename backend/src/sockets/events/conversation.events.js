const { conversation: Conversation,conversationMember:ConversationMember } = require("../../models/conversation");
const mongoose = require("mongoose");
const user = require("../../models/user");

function registerConversationEvents(io, socket) {
  const userId = socket.user._id.toString();
  const chatUserId = socket.chatUserId;
  /*
  ==========================================
  CREATE OR GET PRIVATE CONVERSATION
  ==========================================
  */
  socket.on("conversation:createPrivate", async ({ targetUserId }, cb) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
        return cb?.({ error: "Invalid user id" });
      }

      if (targetUserId === userId) {
        return cb?.({ error: "Cannot create chat with yourself" });
      }

      const users = [userId, targetUserId].sort();
      const privateKey = users.join("_");

      let conversation = await Conversation.findOne({
        type: "private",
        privateKey,
      });

      if (!conversation) {
        conversation = await Conversation.create({
          type: "private",
          privateKey,
          createdBy: userId,
        });

        await ConversationMember.insertMany([
          { conversationId: conversation._id, userId: users[0] },
          { conversationId: conversation._id, userId: users[1] },
        ]);
      }

      cb?.({ success: true, conversation });
    } catch (err) {
      cb?.({ error: err.message });
    }
  });

  /*
  ==========================================
  GET USER CONVERSATIONS
  ==========================================
  */
  socket.on("conversation:getAll", async ({ page = 1, limit = 20 }, cb) => {
    try {
      const memberships = await ConversationMember.find({
        userId,
      })
        .select("conversationId unreadCount")
        .lean();

      const conversationIds = memberships.map((m) => m.conversationId);

      const conversations = await Conversation.find({
        _id: { $in: conversationIds },
      })
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      cb?.({ success: true, conversations });
    } catch (err) {
      cb?.({ error: err.message });
    }
  });

  /*
  ==========================================
  BLOCK USER
  ==========================================
  */
  socket.on("conversation:block", async ({ conversationId }, cb) => {
    try {
      const convo = await Conversation.findById(conversationId);
      if (!convo) return cb?.({ error: "Conversation not found" });

      const membership = await ConversationMember.findOne({
        conversationId,
        userId,
      });

      if (!membership) {
        return cb?.({ error: "Access denied" });
      }

      convo.isBlocked = true;
      convo.blockedBy = userId;
      await convo.save();

      io.to(conversationId).emit("conversation:blocked", {
        conversationId,
        blockedBy: userId,
      });

      cb?.({ success: true });
    } catch (err) {
      cb?.({ error: err.message });
    }
  });

  /*
  ==========================================
  UNBLOCK USER
  ==========================================
  */
  socket.on("conversation:unblock", async ({ conversationId }, cb) => {
    try {
      const convo = await Conversation.findById(conversationId);
      if (!convo) return cb?.({ error: "Conversation not found" });

      const membership = await ConversationMember.findOne({
        conversationId,
        userId,
      });

      if (!membership) return;

      socket.join(conversationId);

      convo.isBlocked = false;
      convo.blockedBy = null;
      await convo.save();

      io.to(conversationId).emit("conversation:unblocked", {
        conversationId,
      });

      cb?.({ success: true });
    } catch (err) {
      cb?.({ error: err.message });
    }
  });

  /*
  ==========================================
  JOIN CONVERSATION ROOM (SECURE)
  ==========================================
  */
  socket.on("join_conversation", async ({ conversationId }) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(conversationId)) return;

      const convo = await Conversation.findById(conversationId).lean();
      if (!convo) return;

      const membership = await ConversationMember.findOne({
        conversationId,
        userId: new mongoose.Types.ObjectId(chatUserId),
      });

      if (!membership) return;
      console.log('user has joined ',conversationId);
      socket.join(conversationId);
    } catch (err) {
      console.error("Join error:", err);
    }
  });

  /*
  ==========================================
  LEAVE CONVERSATION ROOM
  ==========================================
  */
  socket.on("leave_conversation", ({ conversationId }) => {
    socket.leave(conversationId);
  });
}

module.exports = registerConversationEvents;
