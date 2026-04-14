const { conversation, conversationMember } = require("../models/conversation");
const User = require("../models/user");

const getConversationMembers = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { conversationId } = req.params;

    /*
    ==========================
    1. VALIDATE CONVERSATION
    ==========================
    */
    const convo = await conversation.findById(conversationId);

    if (!convo || !["private-group"].includes(convo.type)) {
      return res.status(400).json({
        error: "Invalid group",
      });
    }

    /*
    ==========================
    2. CHECK IF USER IS MEMBER
    ==========================
    */
    const isMember = await conversationMember.findOne({
      conversationId,
      userId,
    });

    if (!isMember) {
      return res.status(403).json({
        error: "You are not a member of this group",
      });
    }

    /*
    ==========================
    3. FETCH MEMBERS
    ==========================
    */
    const members = await conversationMember
      .find({ conversationId })
      .populate("userId", "name uniqueId") // only needed fields
      .sort({ role: -1, joinedAt: 1 }); // admins first

    /*
    ==========================
    4. FORMAT RESPONSE
    ==========================
    */
    const formattedMembers = members.map((m) => ({
      _id: m.userId._id,
      name: m.userId.name,
      uniqueId: m.userId.uniqueId,
      role: m.role,
      joinedAt: m.joinedAt,
    }));

    /*
    ==========================
    5. RESPONSE
    ==========================
    */
    return res.json({
      success: true,
      members: formattedMembers,
    });

  } catch (err) {
    console.error("Get members error:", err);
    return res.status(500).json({
      error: "Failed to fetch members",
    });
  }
};

module.exports = { getConversationMembers };