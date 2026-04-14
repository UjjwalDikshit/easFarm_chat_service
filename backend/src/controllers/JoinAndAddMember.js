const InviteLink = require("../models/invite_link");
const User = require("../models/user"); // make sure this exists

const { conversationMember, conversation } = require("../models/conversation");
const { getIO } = require("../../src/config/socket");

const MAX_GROUP_MEMBERS = 100;

const joinViaInvite = async (req, res) => {
  try {
    console.log("inside");
    const userId = req.user._id.toString();
    console.log(userId);
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Invite code required" });
    }

    const invite = await InviteLink.findOne({ inviteCode: code });

    if (!invite || !invite.isActive) {
      return res.status(400).json({ error: "Invalid invite link" });
    }

    // Expiry
    if (invite.expiresAt && invite.expiresAt < new Date()) {
      return res.status(400).json({ error: "Invite expired" });
    }

    // Usage limit
    if (invite.maxUses && invite.currentUses >= invite.maxUses) {
      return res.status(400).json({ error: "Invite limit reached" });
    }

    const convo = await conversation.findById(invite.conversationId);

    // Only PUBLIC groups allowed
    if (!convo || convo.type !== "free-group") {
      return res.status(403).json({
        error: "Joining not allowed",
      });
    }

    // Already member
    const existing = await conversationMember.findOne({
      conversationId: convo._id,
      userId,
    });

    if (existing) {
      return res.json({
        success: true,
        data: convo,
        message: "Already joined",
      });
    }

    //  MEMBER LIMIT CHECK
    const currentCount = await conversationMember.countDocuments({
      conversationId: convo._id,
    });

    if (currentCount >= MAX_GROUP_MEMBERS) {
      return res.status(400).json({
        error: "Group member limit reached",
      });
    }

    // Add user
    await conversationMember.create({
      conversationId: convo._id,
      userId,
    });

    // Increment usage safely
    invite.currentUses += 1;
    await invite.save();

    return res.json({
      success: true,
      data: convo,
      message: "Joined successfully",
    });
  } catch (err) {
    console.error("Join via invite error:", err);
    res.status(500).json({ error: "Join failed" });
  }
};

const addMember = async (req, res) => {
  try {
    const io = getIO();

    const adminId = req.user._id.toString();
    const { conversationId, uniqueId } = req.body;

    /*
    ==========================
    1. VALIDATION
    ==========================
    */
    if (!conversationId || !uniqueId) {
      return res.status(400).json({
        error: "conversationId and uniqueId are required",
      });
    }

    /*
    ==========================
    2. FIND USER BY UNIQUE ID
    ==========================
    */
    //  FIX: field mismatch (uniqueId vs unique_id)
    const user = await User.findOne({ uniqueId: uniqueId }); //  FIXED

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const memberId = user._id.toString();

    // prevent adding yourself
    if (memberId === adminId) {
      return res.status(400).json({
        error: "Cannot add yourself",
      });
    }

    /*
    ==========================
    3. CHECK GROUP
    ==========================
    */
    const convo = await conversation.findById(conversationId);

    if (!convo || convo.type !== "private-group") {
      return res.status(400).json({
        error: "Invalid group",
      });
    }

    /*
    ==========================
    4. CHECK ADMIN
    ==========================
    */
    const isAdmin = await conversationMember.findOne({
      conversationId,
      userId: adminId,
      role: "admin",
    });

    if (!isAdmin) {
      return res.status(403).json({
        error: "Only admin can add members",
      });
    }

    /*
    ==========================
    5. CHECK IF ALREADY MEMBER
    ==========================
    */
    const exists = await conversationMember.findOne({
      conversationId,
      userId: memberId,
    });

    if (exists) {
      return res.status(400).json({
        error: "User already a member",
      });
    }

    /*
    ==========================
    6. MEMBER LIMIT CHECK
    ==========================
    */
    //  FIX: ensure constant exists
    const MAX_GROUP_MEMBERS = 50; //  define or import properly

    const count = await conversationMember.countDocuments({
      conversationId,
    });

    if (count >= MAX_GROUP_MEMBERS) {
      return res.status(400).json({
        error: "Group member limit reached",
      });
    }

    /*
    ==========================
    7. ADD MEMBER
    ==========================
    */
    await conversationMember.create({
      conversationId,
      userId: memberId,
      role: "member",
      joinedAt: new Date(),
    });

    /*
    ==========================
    8. SOCKET EVENTS
    ==========================
    */

    //  FIX: don't send full convo blindly (heavy + stale risk)
    const minimalConvo = {
      _id: convo._id,
      name: convo.name,
      type: convo.type,
    };

    //  1. notify existing members
    io.to(`conversation:${conversationId}`).emit("member_added", {
      conversationId,
      members: [memberId], //  keep only required
    });

    //  2. notify NEW USER directly
    io.to(`user:${memberId}`).emit("conversation_added", {
      conversation: minimalConvo, //  FIXED (optimized payload)
    });

    /*
    ==========================
    9. RESPONSE
    ==========================
    */
    return res.json({
      success: true,
      message: "Member added successfully",
      user: {
        _id: user._id,
        name: user.name,
        unique_id: user.unique_id, //  consistent naming
      },
    });
  } catch (err) {
    console.error("Add member error:", err.stack); //  better debugging

    return res.status(500).json({
      error: "Failed to add member in backend",
    });
  }
};
module.exports = { addMember, joinViaInvite };
