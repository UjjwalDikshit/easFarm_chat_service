const unblockConversation = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { conversationId } = req.body;

    const convo = await conversation.findById(conversationId);

    if (!convo || convo.type !== "private") {
      return res.status(400).json({
        error: "Invalid conversation",
      });
    }

    if (!convo.isBlocked) {
      return res.status(400).json({
        error: "Conversation not blocked",
      });
    }

    if (convo.blockedBy.toString() !== userId) {
      return res.status(403).json({
        error: "Only blocker can unblock",
      });
    }

    convo.isBlocked = false;
    convo.blockedBy = null;

    await convo.save();

    // 🔥 EMIT
    io.to(`conversation:${conversationId}`).emit("conversation_unblocked", {
      conversationId,
    });
    return res.json({
      success: true,
      message: "Conversation unblocked",
    });
  } catch (err) {
    console.error("Unblock error:", err);
    res.status(500).json({
      error: "Failed to unblock",
    });
  }
};

const blockConversation = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { conversationId } = req.body;

    const convo = await conversation.findById(conversationId);

    if (!convo || convo.type !== "private") {
      return res.status(400).json({
        error: "Only private chats can be blocked",
      });
    }

    // Check membership
    const isMember = await conversationMember.findOne({
      conversationId,
      userId,
    });

    if (!isMember) {
      return res.status(403).json({
        error: "Not part of this conversation",
      });
    }

    // Already blocked?
    if (convo.isBlocked) {
      return res.status(400).json({
        error: "Conversation already blocked",
      });
    }

    convo.isBlocked = true;
    convo.blockedBy = userId;

    await convo.save();
    // 🔥 EMIT
    io.to(`conversation:${conversationId}`).emit("conversation_blocked", {
      conversationId,
      blockedBy: userId,
    });
    return res.json({
      success: true,
      message: "Conversation blocked",
    });
  } catch (err) {
    console.error("Block conversation error:", err);
    res.status(500).json({
      error: "Failed to block conversation",
    });
  }
};

module.exports = { unblockConversation, blockConversation };
