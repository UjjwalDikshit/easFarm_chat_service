const Message = require("../../models/message");
const Conversation = require("../../models/conversation");
const Group = require("../../models/group");

module.exports = function registerReadReceiptEvents(io, socket) {

    socket.on("read", async (data, callback) => {
        try {

            const { type, conversationId, groupId } = data;
            const readerId = socket.userId;

            if (!type) {
                return callback?.({ error: "Type is required" });
            }

            /* =====================================================
               1 PRIVATE CONVERSATION READ RECEIPT
            ===================================================== */

            if (type === "conversation") {

                if (!conversationId) {
                    return callback?.({ error: "conversationId required" });
                }

                // Validate membership
                const conversation = await Conversation.findOne({
                    _id: conversationId,
                    "participants.userId": readerId
                });

                if (!conversation) {
                    return callback?.({ error: "Not part of conversation" });
                }

                // Find unread messages
                const unreadMessages = await Message.find({
                    conversationId,
                    senderId: { $ne: readerId },
                    readBy: { $ne: readerId },
                    deletedGlobally: false
                }).select("_id senderId");

                if (!unreadMessages.length) {
                    return callback?.({ success: true, readCount: 0 });
                }

                const messageIds = unreadMessages.map(m => m._id);

                // Update readBy
                await Message.updateMany(
                    { _id: { $in: messageIds } },
                    { $addToSet: { readBy: readerId } }
                );

                // Notify other participant
                unreadMessages.forEach(msg => {
                    io.to(msg.senderId.toString()).emit("message:read", {
                        conversationId,
                        messageId: msg._id,
                        readerId
                    });
                });

                return callback?.({
                    success: true,
                    readCount: unreadMessages.length
                });
            }

            /* =====================================================
               2 GROUP READ RECEIPT
            ===================================================== */

            if (type === "group") {

                if (!groupId) {
                    return callback?.({ error: "groupId required" });
                }

                // Validate group membership
                const group = await Group.findOne({
                    _id: groupId,
                    "members.userId": readerId,
                    "members.isRemoved": false
                });

                if (!group) {
                    return callback?.({ error: "Not a group member" });
                }

                // IMPORTANT: This requires groupId field in Message schema
                const unreadMessages = await Message.find({
                    groupId,
                    senderId: { $ne: readerId },
                    readBy: { $ne: readerId },
                    deletedGlobally: false
                }).select("_id senderId");

                if (!unreadMessages.length) {
                    return callback?.({ success: true, readCount: 0 });
                }

                const messageIds = unreadMessages.map(m => m._id);

                await Message.updateMany(
                    { _id: { $in: messageIds } },
                    { $addToSet: { readBy: readerId } }
                );

                // Notify each sender
                unreadMessages.forEach(msg => {
                    io.to(msg.senderId.toString()).emit("group:message_read", {
                        groupId,
                        messageId: msg._id,
                        readerId
                    });
                });

                return callback?.({
                    success: true,
                    readCount: unreadMessages.length
                });
            }

        } catch (error) {
            console.error("Read receipt error:", error);
            callback?.({ error: "Failed to mark as read" });
        }
    });
};