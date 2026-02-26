module.exports = function (io, socket, onlineUsers) {

    socket.on("user_online", () => {

        const userId = socket.userId;

        // 1️⃣ If first time online, create entry
        if (!onlineUsers.has(userId)) {
            onlineUsers.set(userId, new Set());
        }

        // 2️⃣ Add this socket to user's socket set
        onlineUsers.get(userId).add(socket.id);

        console.log(`User ${userId} is online`);

        // 3️⃣ Notify only relevant users (better: friends / groups)
        socket.broadcast.emit("user_online", userId);
    });

};