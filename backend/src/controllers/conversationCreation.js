const mongoose = require("mongoose");

const { conversation, conversationMember } = require("../models/conversation");
const InviteLink = require("../models/invite_link");
const ChatUser = require("../models/user");

function generateInviteCode(length = 10) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let code = "";

  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return code;
}



const createConversation = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { type, name, description, members = [] } = req.body;

    const creatorId = req.user._id.toString();
    /*
    ===============================
    PRIVATE CHAT CREATION
    ===============================
    */

    if (type === "private") { // here member array should contain -> user2_id 
      if (members.length !== 1) {
        return res.status(400).json({
          error: "Private chat must contain exactly one user",
        });
      }

      const otherUser = members[0];

      const sorted = [creatorId, otherUser].sort();

      const privateKey = `${sorted[0]}_${sorted[1]}`;

      const existing = await conversation.findOne({
        type: "private",
        privateKey,
      });

      if (existing) {
        return res.json({
          success: true,
          data: existing,
          message: "Conversation already exists",
        });
      }

      const [conv] = await conversation.create(
        [
          {
            type: "private",
            createdBy: creatorId,
            privateKey,
          },
        ],
        { session },
      );

      await conversationMember.insertMany(
        [
          { conversationId: conv._id, userId: creatorId },
          { conversationId: conv._id, userId: otherUser },
        ],
        { session },
      );

      await session.commitTransaction();
      session.endSession();

      return res.status(201).json({
        success: true,
        data: conv,
        message:"Private Conversation created successfully",
      });
    }
    /*
    ===============================
    GROUP CREATION
    ===============================
    */

    if (type === "private-group") {
      if (!name || name.trim().length < 3) {
        return res.status(400).json({
          error: "Group name must be at least 3 characters",
        });
      }

      if (members.length > 100) {
        return res.status(400).json({
          error: "Private group member limit is 100",
        });
      }

      /*
  Remove duplicates
  */

      const uniqueMembers = [...new Set(members.map((id) => id.toString()))];

      /*
  Ensure creator present
  */

      if (!uniqueMembers.includes(creatorId)) {
        uniqueMembers.push(creatorId);
      }

      /*
  Create Conversation
  */

      const [conv] = await conversation.create(
        [
          {
            type: "private-group",
            name: name.trim(),
            description,
            createdBy: creatorId,
          },
        ],
        { session },
      );

      /*
  Create Members
  */

      const memberDocs = uniqueMembers.map((userId) => ({
        conversationId: conv._id,
        userId,
        role: userId === creatorId ? "admin" : "member",
        joinedAt: new Date(),
      }));

      await conversationMember.insertMany(memberDocs, { session });

      /*
  Create Invite Link
  */

      const inviteCode = generateInviteCode();

      const invite = await InviteLink.create(
        [
          {
            conversationId: conv._id,
            inviteCode,
            type: "permanent",
            createdBy: creatorId,
          },
        ],
        { session },
      );

      await session.commitTransaction();
      session.endSession();

      return res.status(201).json({
        success: true,
        message: "Private group created",
        data: {
          conversation: conv,
          inviteLink: invite[0],
        },
      });
    }

    if (type === "free-group") {
      if (!name || name.trim().length < 3) {
        return res.status(400).json({
          error: "Group name must be at least 3 characters",
        });
      }

      /*
  Create conversation
  */

      const [conv] = await conversation.create(
        [
          {
            type: "free-group",
            name: name.trim(),
            description,
            createdBy: creatorId,
          },
        ],
        { session },
      );

      /*
       Add creator as admin
      */

      await conversationMember.create(
        [
          {
            conversationId: conv._id,
            userId: creatorId,
            role: "admin",
            joinedAt: new Date(),
          },
        ],
        { session },
      );

      /*
  Create Invite Link
  */

      const inviteCode = generateInviteCode();

      const invite = await InviteLink.create(
        [
          {
            conversationId: conv._id,
            inviteCode,
            type: "permanent",
            createdBy: creatorId,
          },
        ],
        { session },
      );

      await session.commitTransaction();
      session.endSession();

      return res.status(201).json({
        success: true,
        message: "Public group created",
        data: {
          conversation: conv,
          inviteLink: invite[0],
        },
      });
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Conversation creation error:", error);

    return res.status(500).json({
      error: "Failed to create conversation",
    });
  }
};

module.exports = createConversation;
