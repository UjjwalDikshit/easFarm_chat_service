const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["private"],
      required: true
    },

    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          index: true
        }
      }
    ],

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message"
    },

    isBlocked: {
      type: Boolean,
      default: false
    },

    blockedBy: mongoose.Schema.Types.ObjectId,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  },
  { timestamps: true }
);

// prevent duplicate private chat between same 2 users
conversationSchema.index(
  { "participants.userId": 1 },
  { unique: false }
);

module.exports = mongoose.model("Conversation", conversationSchema);