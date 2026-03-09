const mongoose = require("mongoose");
const  { conversation, conversationMember }= require("../models/conversation");

async function myThing(req, res) {
  try {
    const userId = req.user._id;

    // const memberships = await conversationMember
    //   .find({ userId })
    //   .populate({
    //     path: "conversationId",
    //     populate: {
    //       path: "lastMessageId",
    //     },
    //   })
    //   .sort({ "conversationId.lastMessageAt": -1 });

    // const conversations = memberships
    //   .map((m) => ({
    //     ...m.conversationId.toObject(),
    //     unreadCount: m.unreadCount,
    //     role: m.role,
    //   }))
    //   .filter(Boolean);

    const conversations = await conversationMember.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(userId) },
      },
      {
        $lookup: {
          from: "conversations",
          localField: "conversationId",
          foreignField: "_id",
          as: "conversation",
        },
      },
      {
        $unwind: "$conversation",
      },
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
      {
        $sort: { lastMessageAt: -1 },
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


/*
{
 "success": true,
 "conversations": [
  {
   "_id": "69ac0872dfca00e453c73717",
   "type": "private-group",
   "name": "Farmers Discussion",
   "description": "Private group for farmers",
   "unreadCount": 0,
   "role": "admin",
   "lastMessageAt": "2026-03-07T11:13:54.405Z"
  }
 ]
}
 */