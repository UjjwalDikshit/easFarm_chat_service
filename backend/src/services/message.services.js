const Message = require("../models/message");
const Conversation = require("../models/conversation");

const createMessage = async ({ content, groupId, conversationId, senderId }) => {

    if (!content) {
        throw new Error("Message content is required");
    }

    if (!groupId && !conversationId) {
        throw new Error("Either groupId or conversationId required");
    }

    // 1️⃣ Create message
    const message = await Message.create({
        content,
        sender: senderId,
        group: groupId || null,
        conversation: conversationId || null,
    });

    // 2️⃣ Update lastMessage (for chaining optimization)
    if (conversationId) {
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: message._id
        });
    }

    // 3️⃣ Populate sender for frontend
    const populatedMessage = await Message.findById(message._id)
        .populate("sender", "name email")
        .lean();

    return populatedMessage;
};

module.exports = { createMessage };