const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId,
    emoji: String
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
      index: true
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },

    type: {
      type: String,
      enum: ["text", "image", "video", "document", "voice", "system"],
      default: "text"
    },

    content: {
      text: String,
      mediaUrl: String,
      thumbnailUrl: String,
      fileSize: Number,
      duration: Number
    },

    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message"
    },

    reactions: [reactionSchema],

    deliveredTo: [
      {
        type: mongoose.Schema.Types.ObjectId
      }
    ],

    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId
      }
    ],

    edited: {
      type: Boolean,
      default: false
    },

    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId
      }
    ],

    isDeletedForEveryone: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

messageSchema.index({ groupId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });

module.exports = mongoose.model("Message", messageSchema);