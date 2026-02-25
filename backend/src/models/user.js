const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      unique: true // one chat profile per main user
    },

    isOnline: {
      type: Boolean,
      default: false
    },

    lastSeen: {
      type: Date
    },

    socketId: {
      type: String // for realtime tracking
    },

    mutedGroups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group"
      }
    ],

    archivedChats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group"
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatUser", userSchema);