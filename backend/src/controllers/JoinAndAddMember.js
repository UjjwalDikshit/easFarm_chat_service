const InviteLink = require("../models/invite_link");
const { conversationMember, conversation } = require("../models/conversation");

const MAX_GROUP_MEMBERS = 100;

const joinViaInvite = async (req, res) => {
  try {
    const userId = req.user._id.toString();
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

    // 🔥 MEMBER LIMIT CHECK
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

const addMembers = async (req, res) => {
  try {
    const adminId = req.user._id.toString();
    const { conversationId, members } = req.body;

    if (!conversationId || !Array.isArray(members)) {
      return res.status(400).json({
        error: "Invalid payload",
      });
    }

    if (members.length === 0) {
      return res.status(400).json({
        error: "Members array empty",
      });
    }

    const convo = await conversation.findById(conversationId);

    if (!convo || convo.type !== "private-group") {
      return res.status(400).json({ error: "Invalid group" });
    }

    // Check admin
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

    // Remove duplicates + invalid
    let uniqueMembers = [
      ...new Set(
        members
          .map((id) => id.toString())
          .filter((id) => id !== adminId) // avoid re-adding admin
      ),
    ];

    if (uniqueMembers.length === 0) {
      return res.status(400).json({
        error: "No valid members to add",
      });
    }

    // Remove already existing members
    const existingMembers = await conversationMember.find({
      conversationId,
      userId: { $in: uniqueMembers },
    }).select("userId");

    const existingIds = new Set(
      existingMembers.map((m) => m.userId.toString())
    );

    const newMembers = uniqueMembers.filter(
      (id) => !existingIds.has(id)
    );

    if (newMembers.length === 0) {
      return res.json({
        success: true,
        message: "All users already members",
      });
    }

    // 🔥 MEMBER LIMIT CHECK
    const currentCount = await conversationMember.countDocuments({
      conversationId,
    });

    if (currentCount + newMembers.length > MAX_GROUP_MEMBERS) {
      return res.status(400).json({
        error: `Adding exceeds group limit (${MAX_GROUP_MEMBERS})`,
      });
    }

    // Insert members
    const docs = newMembers.map((userId) => ({
      conversationId,
      userId,
      role: "member",
      joinedAt: new Date(),
    }));

    await conversationMember.insertMany(docs, {
      ordered: false, // ignore duplicates safely
    });

    
    // EMIT EVENT
    io.to(`conversation:${conversationId}`).emit("member_added", {
      conversationId,
      members: docs.map(m => m.userId),
    });

    return res.json({
      success: true,
      message: "Members added successfully",
      addedCount: docs.length,
    });

  } catch (err) {
    console.error("Add members error:", err);
    res.status(500).json({
      error: "Failed to add members",
    });
  }
};
module.exports = {addMembers,joinViaInvite};