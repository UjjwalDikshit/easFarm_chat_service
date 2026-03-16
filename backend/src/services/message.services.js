const Message = require("../models/message");
const Conversation = require("../models/conversation");

const createMessage = async ({ type, content, conversationId, senderId }) => {
  if (!content) {
    throw new Error("Message content is required");
  }

  if (!conversationId) {
    throw new Error("Either groupId or conversationId required");
  }

  // 1️⃣ Create message
  const message = await Message.create({
    type,
    content,
    senderId,
    conversationId,
  });

  // 2️⃣ Update lastMessage (for chaining optimization)
  if (conversationId) {
    await Conversation.conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
    });
  }

  const populatedMessage = await Message.findById(message._id)
    .populate("senderId", "name uniqueId")
    .lean();

  return {
    ...populatedMessage,
    sender: populatedMessage.senderId, // sender info
    senderId: populatedMessage.senderId._id.toString(), // real id
  };
};

module.exports = { createMessage };
