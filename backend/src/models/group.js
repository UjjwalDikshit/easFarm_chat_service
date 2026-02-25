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
      enum: ["member", "admin"],
      default: "member"
    },

    joinedAt: {
      type: Date,
      default: Date.now
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

    description: {
      type: String
    },

    settings: {
      memberLimit: {
        type: Number,
        default: null
      },

      roleLimits: {
        admin: {
          type: Number,
          default: 1
        },

        moderator: {
          type: Number,
          default: 0
        }
      }
    },

    members: [memberSchema],

    isBanned: {
      type: Boolean,
      default: false
    },

    bannedBy: {
      type: mongoose.Schema.Types.ObjectId
    },

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