const mongoose = require("mongoose");
const { conversation, conversationMember } = require("../models/conversation");
const ChatUser = require("../models/user");
const InviteLink = require("../models/invite_link");

function generateInviteCode(length = 10) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function generateUniqueInviteCode(session) {
  let code;
  let exists = true;

  while (exists) {
    code = generateInviteCode();
    exists = await InviteLink.exists({ inviteCode: code }).session(session);
  }

  return code;
}

const createConversation = async (req, res) => {
  const session = await mongoose.startSession();

  let responseData;
  let statusCode = 200;

  try {
    await session.withTransaction(async () => {
      const { type, name, description, members = [] } = req.body;
      const creatorId = req.user._id.toString();

      /*
      ===============================
      VALIDATE TYPE
      ===============================
      */

      if (!["private", "private-group", "free-group"].includes(type)) {
        throw new Error("Invalid conversation type");
      }

      /*
      ===============================
      PRIVATE CHAT
      ===============================
      */

      if (type === "private") {
        if (members.length !== 1) {
          responseData = {
            error: "Private chat must contain exactly one user",
          };
          statusCode = 400;
          return;
        }

        const otherUserUniqueId = members[0];

        const otherUserDoc = await ChatUser.findOne({
          uniqueId: otherUserUniqueId,
        })
          .select("_id")
          .session(session);

        if (!otherUserDoc) {
          responseData = { error: "User not found" };
          statusCode = 404;
          return;
        }

        const otherUser = otherUserDoc._id.toString();

        if (!otherUser || otherUser === creatorId) {
          responseData = {
            error: "Invalid user for private chat",
          };
          statusCode = 400;
          return;
        }

        const otherUserData = await ChatUser.findById(otherUser)
          .select("_id name avatar")
          .lean()
          .session(session);

        const privateKey = [creatorId, otherUser].sort().join("_");

        let conv = await conversation
          .findOne({
            type: "private",
            privateKey,
          })
          .session(session);

        let membership;

        if (!conv) {
          try {
            [conv] = await conversation.create(
              [
                {
                  type: "private",
                  createdBy: creatorId,
                  privateKey,
                  lastMessageAt: new Date(),
                  lastMessageId: null, // ✅ ADD THIS
                },
              ],
              { session },
            );

            await conversationMember.insertMany(
              [
                {
                  conversationId: conv._id,
                  userId: creatorId,
                  role: "admin",
                  joinedAt: new Date(),
                  unreadCount: 0, // ✅ ADD
                },
                {
                  conversationId: conv._id,
                  userId: otherUser,
                  role: "member",
                  joinedAt: new Date(),
                  unreadCount: 0, // ✅ ADD
                },
              ],
              { session },
            );

            // since just created
            membership = { role: "admin", unreadCount: 0 };
          } catch (err) {
            if (err.code === 11000) {
              conv = await conversation
                .findOne({ privateKey })
                .session(session);
            } else {
              throw err;
            }
          }
        }

        // VERY IMPORTANT: fetch membership if conversation already existed
        if (!membership) {
          membership = await conversationMember
            .findOne({
              conversationId: conv._id,
              userId: creatorId,
            })
            .select("role unreadCount")
            .lean()
            .session(session);
        }

        responseData = {
          success: true,
          data: {
            conversation: {
              ...(conv.toObject ? conv.toObject() : conv),
              
              role: membership?.role || "member",
              unreadCount: membership?.unreadCount || 0,

              otherMember: otherUserData,

              lastMessage: null,
            },
          },
          message: "Private conversation ready",
        };
        statusCode = 200;
        return;
      }

      /*
      ===============================
      GROUP COMMON VALIDATION
      ===============================
      */

      if (!name || name.trim().length < 3) {
        responseData = {
          error: "Group name must be at least 3 characters",
        };
        statusCode = 400;
        return;
      }

      /*
      ===============================
      PRIVATE GROUP
      ===============================
      */

      if (type === "private-group") {
        if (members.length > 100) {
          responseData = {
            error: "Private group member limit is 100",
          };
          statusCode = 400;
          return;
        }

        const users = await ChatUser.find({
          uniqueId: { $in: members },
        })
          .select("_id")
          .session(session);

        if (users.length !== members.length) {
          responseData = {
            error: "Some users not found",
          };
          statusCode = 400;
          return;
        }

        let uniqueMembers = [...new Set(users.map((u) => u._id.toString()))];

        if (!uniqueMembers.includes(creatorId)) {
          uniqueMembers.push(creatorId);
        }

        const [conv] = await conversation.create(
          [
            {
              type,
              name: name.trim(),
              description,
              createdBy: creatorId,
              lastMessageAt: new Date(),
              lastMessageId: null, // ✅ ADD THIS
            },
          ],
          { session },
        );

        const memberDocs = uniqueMembers.map((userId) => ({
          conversationId: conv._id,
          userId,
          role: userId === creatorId ? "admin" : "member",
          joinedAt: new Date(),
          unreadCount: 0, // ✅ ADD
        }));

        await conversationMember.insertMany(memberDocs, { session });

        responseData = {
          success: true,
          message: "Private group created",
          data: {
            conversation: {
              ...(conv.toObject ? conv.toObject() : conv),

              unreadCount: 0,
              role: "admin", // creator

              otherMember: null, // important
              lastMessage: null,
            },
          },
        };
        statusCode = 201;
        return;
      }

      /*
      ===============================
      FREE GROUP (PUBLIC)
      ===============================
      */

      if (type === "free-group") {
        const [conv] = await conversation.create(
          [
            {
              type,
              name: name.trim(),
              description,
              createdBy: creatorId,
              lastMessageAt: new Date(),
              lastMessageId: null, // ✅ ADD THIS
            },
          ],
          { session },
        );

        await conversationMember.insertMany(
          [
            {
              conversationId: conv._id,
              userId: creatorId,
              role: "admin",
              joinedAt: new Date(),
              unreadCount: 0,
            },
          ],
          { session },
        );

        const inviteCode = await generateUniqueInviteCode(session);

        const [invite] = await InviteLink.create(
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

        responseData = {
          success: true,
          message: "Public group created",
          data: {
            conversation: {
              ...(conv.toObject ? conv.toObject() : conv),

              unreadCount: 0,
              role: "admin",

              otherMember: null,
              lastMessage: null,
            },
            inviteLink: invite,
          },
        };
        statusCode = 201;
        return;
      }
    });

    return res.status(statusCode).json(responseData);
  } catch (error) {
    console.error("Conversation creation error:", error);

    return res.status(500).json({
      error: error.message || "Failed to create conversation",
    });
  } finally {
    session.endSession();
  }
};

module.exports = createConversation;
