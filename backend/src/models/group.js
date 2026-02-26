const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },

    role: {
      type: String,
      enum: ["member", "admin", "superadmin"],
      default: "member"
    },

    joinedAt: {
      type: Date,
      default: Date.now
    },

    isRemoved: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    description: String,

    groupType: {
      type: String,
      enum: ["free", "premium"],
      default: "free"
    },

    settings: {
      memberLimit: {
        type: Number,
        default: null
      },

      roleLimits: {
        admin: { type: Number, default: 5 },
        superadmin: { type: Number, default: 1 }
      }
    },

    members: [memberSchema],

    memberCount: {
      type: Number,
      default: 1
    },

    isBanned: {
      type: Boolean,
      default: false
    },

    bannedBy: mongoose.Schema.Types.ObjectId,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message"
    }
  },
  { timestamps: true }
);

groupSchema.index({ "members.userId": 1 });

module.exports = mongoose.model("Group", groupSchema);