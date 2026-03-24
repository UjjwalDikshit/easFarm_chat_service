const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["private", "free-group", "private-group"],
      required: true,
      index: true,
    },

    // Only for groups
    name: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatUser",
      required: true,
    },

    // For fast chat list sorting
    lastMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },

    lastMessageAt: {
      type: Date,
      index: true,
    },

    // Deterministic key for private chat (prevents duplicate)
    privateKey: {
      type: String,
      unique: true,
      sparse: true,
    },

    // Blocking (private only)
    isBlocked: {
      type: Boolean,
      default: false,
    },
    idDeleted:{
      type:Boolean,
      default:false,
    },
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatUser",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Fast sorting for chat list
conversationSchema.index({ lastMessageAt: -1 });

//  Prevent duplicate private chats
conversationSchema.index(
  { type: 1, privateKey: 1 },
  {
    unique: true,
    partialFilterExpression: {
      type: "private",
      privateKey: { $exists: true }
    }
  }
);

const conversation = mongoose.model("Conversation", conversationSchema);

const conversationMemberSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatUser",
      required: true,
    },

    role: {
      type: String,
      enum: ["member", "admin"],
      default: "member",
    },

    lastReadMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },

    unreadCount: {
      type: Number,
      default: 0,
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  },
);

// 🔥 Ensure one membership per user per conversation
conversationMemberSchema.index(
  { conversationId: 1, userId: 1 },
  { unique: true },
);
conversationMemberSchema.index({ conversationId: 1 });
// 🔥 Get all conversations of a user quickly
conversationMemberSchema.index({ userId: 1 });

const conversationMember = mongoose.model(
  "ConversationMember",
  conversationMemberSchema,
);
module.exports = { conversation, conversationMember };
