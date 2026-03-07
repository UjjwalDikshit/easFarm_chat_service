const mongoose = require("mongoose");

const blockSchema = new mongoose.Schema(
  {
    blockerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatUser",
      required: true,
      index: true,
    },

    blockedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatUser",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// 🔥 Prevent duplicate blocks
blockSchema.index(
  { blockerId: 1, blockedId: 1 },
  { unique: true }
);

// 🔥 Fast lookup: who blocked this user
blockSchema.index({ blockedId: 1 });

module.exports = mongoose.model("Block", blockSchema);