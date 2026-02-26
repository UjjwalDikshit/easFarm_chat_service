const registerMessageEvents = require("./events/message.events");
const registerGroupEvents = require("./events/group.events");
const registerPresenceEvents = require("./events/presence.events");
const registerTypingEvents = require("./events/typing.events");

const socketAuthMiddleware = require("./middleware/auth.socket");
const disconnectEvent = require("./events/disconnect.event");

const onlineUsers = new Map(); 
const typingUsers = new Map(); 

module.exports = function (io) {

    io.use(socketAuthMiddleware); // authenticate socket

    io.on("connection", (socket) => {

        console.log("User connected:", socket.userId);

        registerMessageEvents(io, socket);
        registerGroupEvents(io, socket);
        registerPresenceEvents(io, socket,onlineUsers);
        registerTypingEvents(io, socket);
        registerReadReceiptEvents(io, socket);
        registerConversationEvents(io, socket);
        // registerNotificationEvents(io, socket);

        socket.on("disconnect", () => {
            disconnectEvent.removeOnlineUser(onlineUsers);
            disconnectEvent.removeTypingUser(typingUsers)
            console.log("User disconnected:", socket.userId);
        });
    });
};