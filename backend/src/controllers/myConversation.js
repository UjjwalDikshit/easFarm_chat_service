const Message = require("../models/message");
const {conversationMember} = require('../../src/models/conversation')

const getAllMessageOfConversation = async (req, res) => {
  try {
    const { conversationId, cursor } = req.query;

    const LIMIT = 20;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "conversationId required",
      });
    }

    // Query object
    let query = {
      conversationId,
      deletedGlobally: false,
    };

    // Pagination condition (scroll up)
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 }) // newest first
      .limit(LIMIT)
      .lean();

      const members = await conversationMember.find({
        conversationId
      }).select("userId lastReadMessageId");

    return res.status(200).json({
      success: true,
      count: messages.length,
      messages,
      members,
      nextCursor:
        messages.length > 0 ? messages[messages.length - 1].createdAt : null,
    });
  } catch (error) {
    console.error("Fetch messages error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = getAllMessageOfConversation;