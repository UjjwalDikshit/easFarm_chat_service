const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["text", "image", "video", "document", "voice", "system"],
      default: "text",
    },

    content: {
      text: String,
      mediaUrl: String,
      thumbnailUrl: String,
      fileSize: Number,
      duration: Number,
    },

    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },

    reactions: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        emoji: String,
      },
    ],

    deliveredTo: [mongoose.Schema.Types.ObjectId],
    readBy: [mongoose.Schema.Types.ObjectId],

    edited: {
      type: Boolean,
      default: false,
    },

    deletedForUsers: [mongoose.Schema.Types.ObjectId],

    deletedGlobally: {
      type: Boolean,
      default: false,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    deletedBy: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true },
);

messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ conversationId: 1, readBy: 1 });
messageSchema.index({ groupId: 1, readBy: 1 });

module.exports = mongoose.model("Message", messageSchema);
