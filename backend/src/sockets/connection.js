const registerMessageEvents = require("./events/message.events");
const registerGroupEvents = require("./events/group.events");
const registerPresenceEvents = require("./events/presence.events");
const registerTypingEvents = require("./events/typing.events");
const registerReadReceiptEvents = require("./events/readreciept.events");
const socketAuthMiddleware = require("./middleware/auth.socket");
const disconnectEvent = require("./events/disconnect.event");
const registerNotificationEvents = require("./events/Notification.events");
const registerConversationEvents = require("./events/conversation.events");

const onlineUsers = new Map();
const typingUsers = new Map();

module.exports = function (io) {
  io.use(socketAuthMiddleware);  //authenticate socket

  io.on("connection", (socket) => {
    console.log("User connected:", socket.chatUserId);

    // join personal room
    socket.join(`user:${socket.chatUserId}`);
    
    registerMessageEvents(io, socket);
    // registerGroupEvents(io, socket);
    // registerPresenceEvents(io, socket, onlineUsers);
    // registerTypingEvents(io, socket, typingUsers);
    // registerReadReceiptEvents(io, socket);
    registerConversationEvents(io, socket);
    // registerNotificationEvents(io, socket);

    socket.on("disconnect", () => {
      // disconnectEvent.removeOnlineUser(socket, onlineUsers);
      // disconnectEvent.removeTypingUser(socket, typingUsers);
      console.log("User disconnected:", socket.chatUserId);
    });
  });
};
