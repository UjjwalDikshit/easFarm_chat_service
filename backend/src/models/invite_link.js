const mongoose = require("mongoose");

const inviteSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
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

    expiresAt: {
      type: Date
    },

    maxUses: {
      type: Number
    },

    currentUses: {
      type: Number,
      default: 0
    },

    isActive: {
      type: Boolean,
      default: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  },
  { timestamps: true }
);

inviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("InviteLink", inviteSchema);