const mongoose = require("mongoose");
const { conversation, conversationMember } = require("../models/conversation");

async function myThing(req, res) {
  try {
    const userId = req.user._id;

    const conversations = await conversationMember.aggregate([
      
      // 1️ Find all conversations where current user is a member
      {
        $match: { userId: new mongoose.Types.ObjectId(userId) },
      },

      // 2️ Join conversation details
      {
        $lookup: {
          from: "conversations",
          localField: "conversationId",
          foreignField: "_id",
          as: "conversation",
        },
      },

      // conversation comes as array → convert to object
      {
        $unwind: "$conversation",
      },

      // 3️ Merge membership data into conversation object
      // So frontend gets everything in one object
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              "$conversation",
              {
                unreadCount: "$unreadCount",
                role: "$role",
                membershipId: "$_id",
              },
            ],
          },
        },
      },

      // =========================
      // ONLY FOR PRIVATE CHAT → FIND OTHER MEMBER
      // =========================

      // 4️ Get all members of this conversation
      {
        $lookup: {
          from: "conversationmembers",
          localField: "_id",
          foreignField: "conversationId",
          as: "members",
        },
      },

      // 5️ From members list remove current user
      // Remaining user = other member
      {
        $addFields: {
          otherMemberId: {
            $cond: [
              { $eq: ["$type", "private"] }, // only run for private chats
              {
                $first: {
                  $filter: {
                    input: "$members",
                    as: "member",
                    cond: {
                      $ne: [
                        "$$member.userId",
                        new mongoose.Types.ObjectId(userId),
                      ],
                    },
                  },
                },
              },
              null, // for group chats keep null
            ],
          },
        },
      },

      // 6️ Fetch other member user details
      {
        $lookup: {
          from: "chatusers",
          localField: "otherMemberId.userId",
          foreignField: "_id",
          as: "otherMember",
        },
      },

      {
        $unwind: {
          path: "$otherMember",
          preserveNullAndEmptyArrays: true, // groups will keep null
        },
      },

      // =========================
      // GET LAST MESSAGE
      // =========================

      // 7️ Fetch last message for preview in chat list
      {
        $lookup: {
          from: "messages",
          localField: "lastMessageId",
          foreignField: "_id",
          as: "lastMessage",
        },
      },

      {
        $unwind: {
          path: "$lastMessage",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 8️ Sort conversations by last activity
      {
        $sort: { lastMessageAt: -1 },
      },

      // 9️⃣ Clean unnecessary internal fields
      {
        $project: {
          members: 0,
          otherMemberId: 0,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      conversations,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = myThing;