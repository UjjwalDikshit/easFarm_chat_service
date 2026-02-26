const Group = require("../../models/group");

module.exports = function (io, socket) {
  socket.on("join_group", async (groupId, callback) => {
    try {
      //  Validate groupId
      if (!groupId) {
        return callback?.({ error: "Group ID is required" });
      }

      //  Check if group exists
      const group = await Group.findById(groupId).select("_id members name");

      if (!group) {
        return callback?.({ error: "Group not found" });
      }

      // Check if user is a member
      const isMember = group.members.some(
        (memberId) => memberId.toString() === socket.userId,
      );

      if (!isMember) {
        return callback?.({ error: "Access denied: Not a group member" });
      }

      if (!socket.rooms.has(groupId)) {
        socket.join(groupId);
      }

      console.log(`User ${socket.userId} joined group ${groupId}`);

      //  Optional: Notify others user is online in group
      socket.to(groupId).emit("group_user_joined", {
        userId: socket.userId,
        groupId,
      });

      // 6️⃣ Send success acknowledgment
      callback?.({
        success: true,
        groupId,
        groupName: group.name,
      });
    } catch (error) {
      console.error("Join group error:", error);
      callback?.({ error: "Failed to join group" });
    }
  });
};
