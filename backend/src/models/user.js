const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      index: true
    },

    uniqueId: {
      type: String,
      unique: true
    },

    isOnline: {
      type: Boolean,
      default: false
    },

    lastSeen: Date,

    socketId: String,

    mutedConversations: [
      {
        type: mongoose.Schema.Types.ObjectId
      }
    ],

    archivedConversations: [
      {
        type: mongoose.Schema.Types.ObjectId
      }
    ],

    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatUser", userSchema);