const { getIO } = require("../config/socket");
const { conversation, conversationMember } = require("../models/conversation");
const User  = require('../models/user')

const leaveGroup = async (req, res) => {
  try {
    const io = getIO();

    const userId = req.user._id.toString();
    const { conversationId } = req.query;
    /*
    ==========================
    1. VALIDATE CONVERSATION
    ==========================
    */
    const convo = await conversation.findById(conversationId);

    if (!convo || !["private-group", "free-group"].includes(convo.type)) {
      return res.status(400).json({ error: "Invalid group",convo });
    }

    /*
    ==========================
    2. CHECK MEMBERSHIP
    ==========================
    */
    const member = await conversationMember.findOne({
      conversationId,
      userId,
    });

    if (!member) {
      return res.status(400).json({ error: "Not a member" });
    }

    /*
    ==========================
    3. ADMIN LOGIC
    ==========================
    */
    if (member.role === "admin") {
      const adminCount = await conversationMember.countDocuments({
        conversationId,
        role: "admin",
      });

      //  LAST ADMIN → DELETE GROUP
      if (adminCount === 1) {
        const members = await conversationMember.find({ conversationId });

        // delete group
        await conversation.deleteOne({ _id: conversationId });
        await conversationMember.deleteMany({ conversationId });

        /*
        ==========================
        SOCKET: REMOVE FOR ALL USERS
        ==========================
        */
        members.forEach((m) => {
          io.to(`user:${m.userId}`).emit("conversation_removed", {
            conversationId,
          });
        });

        return res.json({
          success: true,
          message: "Group deleted successfully",
        });
      }
    }

    /*
    ==========================
    4. NORMAL LEAVE
    ==========================
    */
    await conversationMember.deleteOne({
      conversationId,
      userId,
    });

    /*
    ==========================
    5. SOCKET EVENTS
    ==========================
    */

    // notify remaining members
    io.to(`conversation:${conversationId}`).emit("member_left", {
      conversationId,
      userId,
    });

    // notify leaving user → remove from UI
    io.to(`user:${userId}`).emit("conversation_removed", {
      conversationId,
    });

    return res.json({
      success: true,
      message: "Left group successfully",
    });
  } catch (err) {
    console.error("Leave group error:", err.stack);
    return res.status(500).json({
      error: "Failed to leave group",
    });
  }
};


const removeMember = async (req, res) => {
  try {
    const io = getIO(); //  FIX

    const adminId = req.user._id.toString();
    const { conversationId, uniqueId } = req.body;
    console.log(conversationId, uniqueId);
    /*
    ==========================
    1. VALIDATION
    ==========================
    */
    if (!conversationId || !uniqueId) {
      return res.status(400).json({ error: "Missing data" });
    }

    /*
    ==========================
    2. FIND USER
    ==========================
    */
    const user = await User.findOne({ uniqueId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const memberId = user._id.toString();

    /*
    ==========================
    3. PREVENT SELF REMOVE
    ==========================
    */
    if (adminId === memberId) {
      return res.status(400).json({
        error: "Use leave group instead",
      });
    }

    /*
    ==========================
    4. CHECK GROUP
    ==========================
    */
    const convo = await conversation.findById(conversationId);

    if (!convo || convo.type !== "private-group") {
      return res.status(400).json({ error: "Invalid group" });
    }

    /*
    ==========================
    5. CHECK ADMIN
    ==========================
    */
    const isAdmin = await conversationMember.findOne({
      conversationId,
      userId: adminId,
      role: "admin",
    });

    if (!isAdmin) {
      return res.status(403).json({
        error: "Only admin can remove members",
      });
    }

    /*
    ==========================
    6. CHECK TARGET MEMBER
    ==========================
    */
    const targetMember = await conversationMember.findOne({
      conversationId,
      userId: memberId,
    });

    if (!targetMember) {
      return res.status(400).json({
        error: "User is not a member",
      });
    }

    /*
    ==========================
    7. PREVENT ADMIN REMOVE
    ==========================
    */
    if (targetMember.role === "admin") {
      return res.status(400).json({
        error: "Cannot remove another admin",
      });
    }

    /*
    ==========================
    8. DELETE MEMBER
    ==========================
    */
    await conversationMember.deleteOne({
      conversationId,
      userId: memberId,
    });

    /*
    ==========================
    9. SOCKET EVENTS
    ==========================
    */

    // notify group
    io.to(`conversation:${conversationId}`).emit("member_removed", {
      conversationId,
      userId: memberId,
    });

    // notify removed user (VERY IMPORTANT)
    io.to(`user:${memberId}`).emit("conversation_removed", {
      conversationId,
    });

    /*
    ==========================
    10. RESPONSE
    ==========================
    */
    return res.json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (err) {
    console.error("Remove member error:", err);
    res.status(500).json({
      error: "Failed to remove member",
    });
  }
};


 const promoteToAdmin = async (req, res) => {
  const adminId = req.user._id.toString();
  const { conversationId, memberId } = req.body;

  const isAdmin = await conversationMember.findOne({
    conversationId,
    userId: adminId,
    role: "admin",
  });

  if (!isAdmin) {
    return res.status(403).json({ error: "Only admin allowed" });
  }

  await conversationMember.updateOne(
    { conversationId, userId: memberId },
    { $set: { role: "admin" } },
  );

  res.json({ success: true });
};


module.exports = { leaveGroup, removeMember };
