const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    // Which conversation this message belongs to
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Conversation",
      index: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "ChatUser",
      index: true,
    },

    type: {
      type: String,
      enum: ["text", "image", "video", "audio", "file", "system"],
      default: "text",
    },

    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    edited: {
      type: Boolean,
      default: false,
    },

    deletedGlobally: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
    versionKey: false,
  },
);

// 🚀 CRITICAL INDEX FOR FAST PAGINATION
// Used in: Message.find({ conversationId }).sort({ createdAt: -1 }).limit(20)
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({
  conversationId: 1,
  deletedGlobally: 1,
  createdAt: -1,
});
// Optional: fast sender lookup (analytics, moderation, etc.)
messageSchema.index({ senderId: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);
