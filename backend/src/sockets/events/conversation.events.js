const {conversation:Conversation} = require("../../models/conversation");
const mongoose = require("mongoose");

function registerConversationEvents(io, socket) {
  const userId = socket.user._id.toString();

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

      // create deterministic private key
      const users = [userId, targetUserId].sort();
      const privateKey = users.join("_");

      // atomic upsert prevents duplicates
      const conversation = await Conversation.findOneAndUpdate(
        { type: "private", privateKey },
        {
          $setOnInsert: {
            type: "private",
            privateKey,
            participants: users.map(id => ({ userId: id })),
            createdBy: userId
          }
        },
        { new: true, upsert: true }
      );

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
      const conversations = await Conversation.find({
        "participants.userId": userId
      })
        .populate("lastMessage")
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

      const isParticipant = convo.participants.some(
        p => p.userId.toString() === userId
      );

      if (!isParticipant) {
        return cb?.({ error: "Access denied" });
      }

      convo.isBlocked = true;
      convo.blockedBy = userId;
      await convo.save();

      io.to(conversationId).emit("conversation:blocked", {
        conversationId,
        blockedBy: userId
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

      const isParticipant = convo.participants.some(
        p => p.userId.toString() === userId
      );

      if (!isParticipant) {
        return cb?.({ error: "Access denied" });
      }

      convo.isBlocked = false;
      convo.blockedBy = null;
      await convo.save();

      io.to(conversationId).emit("conversation:unblocked", {
        conversationId
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
  socket.on("conversation:join", async ({ conversationId }) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(conversationId)) return;

      const convo = await Conversation.findById(conversationId).lean();
      if (!convo) return;

      const isParticipant = convo.participants.some(
        p => p.userId.toString() === userId
      );

      if (!isParticipant) return;

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
  socket.on("conversation:leave", ({ conversationId }) => {
    socket.leave(conversationId);
  });
}

module.exports = registerConversationEvents;