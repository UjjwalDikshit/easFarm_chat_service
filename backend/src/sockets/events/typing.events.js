module.exports = function (io, socket) {

    socket.on("typing:start", ({ groupId }) => {

        if (!groupId || !socket.userId) return;

        const key = `${groupId}_${socket.userId}`;

        // Clear existing timeout if still typing
        if (typingUsers.has(key)) {
            clearTimeout(typingUsers.get(key));
        } else {
            // Only emit start if not already typing
            socket.to(groupId).emit("typing:start", {
                groupId,
                userId: socket.userId
            });
        }

        // Auto stop after 3 seconds of inactivity
        const timeout = setTimeout(() => {

            socket.to(groupId).emit("typing:stop", {
                groupId,
                userId: socket.userId
            });

            typingUsers.delete(key);

        }, 3000);

        typingUsers.set(key, timeout);
    });


    socket.on("typing:stop", ({ groupId }) => {

        if (!groupId || !socket.userId) return;

        const key = `${groupId}_${socket.userId}`;

        if (typingUsers.has(key)) {
            clearTimeout(typingUsers.get(key));
            typingUsers.delete(key);

            socket.to(groupId).emit("typing:stop", {
                groupId,
                userId: socket.userId
            });
        }
    });


};