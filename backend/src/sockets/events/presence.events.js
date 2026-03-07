module.exports = function (io, socket, onlineUsers) {

  const userId = socket.user._id.toString(); // ✅ correct source

  /*
  ======================================
  USER CONNECTED (AUTO ON CONNECTION)
  ======================================
  */

  // 1️⃣ Create entry if not exists
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }

  // 2️⃣ Add this socket
  onlineUsers.get(userId).add(socket.id);

  // 3️⃣ If first active socket → user just came online
  if (onlineUsers.get(userId).size === 1) {
    console.log(`User ${userId} is online`);

    // Emit only once when first socket connects
    socket.broadcast.emit("user_online", userId);
  }

  /*
  ======================================
  HANDLE DISCONNECT
  ======================================
  */
  socket.on("disconnect", () => {

    if (!onlineUsers.has(userId)) return;

    // Remove this socket
    onlineUsers.get(userId).delete(socket.id);

    // If no more sockets → user offline
    if (onlineUsers.get(userId).size === 0) {

      onlineUsers.delete(userId);

      console.log(`User ${userId} is offline`);

      socket.broadcast.emit("user_offline", userId);
    }
  });

};