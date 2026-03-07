const mongoose = require("mongoose");

const inviteSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true
    },

    inviteCode: {
      type: String,
      required: true,
      unique: true
    },

    type: {
      type: String,
      enum: ["permanent", "expiring", "limited"],
      required: true
    },

    expiresAt: Date,

    maxUses: Number,

    currentUses: {
      type: Number,
      default: 0
    },

    isActive: {
      type: Boolean,
      default: true
    },

    createdBy: mongoose.Schema.Types.ObjectId
  },
  { timestamps: true }
);

inviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("InviteLink", inviteSchema);