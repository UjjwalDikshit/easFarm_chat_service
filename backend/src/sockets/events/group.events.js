const Group = require("../../models/conversation");

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
        (member) =>
          member.userId.toString() === socket.userId && !member.isRemoved,
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

  socket.on("group:leave", async ({ groupId }, cb) => {
    try {
      const group = await Group.findById(groupId);

      if (!group) {
        return cb?.({ error: "Group not found" });
      }

      const memberIndex = group.members.findIndex(
        (m) => m.userId.toString() === socket.user._id.toString(),
      );

      if (memberIndex === -1) {
        return cb?.({ error: "You are not a member of this group" });
      }

      // prevent superadmin leaving without transfer
      if (group.members[memberIndex].role === "superadmin") {
        return cb?.({
          error: "Superadmin cannot leave without transferring ownership",
        });
      }

      // remove member
      group.members.splice(memberIndex, 1);
      group.memberCount = group.members.length;

      await group.save();

      // remove from socket room
      socket.leave(groupId);

      // notify others
      socket.to(groupId).emit("group:userLeft", {
        groupId,
        userId: socket.user._id,
      });

      cb?.({ success: true });
    } catch (err) {
      cb?.({ error: err.message });
    }
  });
};
