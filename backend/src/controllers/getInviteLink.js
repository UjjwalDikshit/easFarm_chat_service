const InviteLink = require("../models/invite_link");
const { conversation, conversationMember } = require("../models/conversation");

exports.getInviteLink = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { conversationId } = req.params;

    /*
    =========================
    1. CHECK MEMBERSHIP
    =========================
    */
    const membership = await conversationMember.findOne({
      conversationId,
      userId,
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    /*
    =========================
    2. CHECK GROUP TYPE
    =========================
    */
    const convo = await conversation.findById(conversationId);

    if (!convo || convo.type !== "free-group") {
      return res.status(400).json({
        success: false,
        message: "Invite link only available for public groups",
      });
    }

    /*
    =========================
    3. GET OR CREATE LINK
    =========================
    */
    let invite = await InviteLink.findOne({
      conversationId,
      isActive: true,
    });

    console.log(invite);

    // If not exist → create one
    if (!invite) {
      const code = generateInviteCode(10);

      invite = await InviteLink.create({
        conversationId,
        code,
        createdBy: userId,
      });
    }

    /*
    =========================
    4. RETURN FULL LINK
    =========================
    */
    

    return res.status(200).json({
      success: true,
      invite
    });
  } catch (error) {
    console.error("Get Invite Link Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};