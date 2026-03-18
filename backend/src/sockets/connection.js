const registerMessageEvents = require("./events/message.events");
const registerPresenceEvents = require("./events/presence.events");
const registerTypingEvents = require("./events/typing.events");
const registerReadReceiptEvents = require("./events/readreciept.events");
const socketAuthMiddleware = require("./middleware/auth.socket");
const disconnectEvent = require("./events/disconnect.event");
const registerNotificationEvents = require("./events/Notification.events");
const registerConversationEvents = require("./events/conversation.events");
const presenceListener = require("./events/presence.listener");
const cleanPresence = require("./events/clearPresence");

const typingUsers = new Map();

module.exports = function (io) {
  presenceListener(io);
  io.use(socketAuthMiddleware); //authenticate socket

  io.on("connection", (socket) => {
    console.log("User connected:", socket.chatUserId);

    // join personal room
    socket.join(`user:${socket.chatUserId}`);

    registerMessageEvents(io, socket);
    // registerPresenceEvents(io, socket);
    // registerTypingEvents(io, socket, typingUsers);
    registerReadReceiptEvents(io, socket);
    registerConversationEvents(io, socket);
    // registerNotificationEvents(io, socket);

    socket.on("disconnect", async() => {
      await disconnectEvent.removeOnlineUser(socket);
      disconnectEvent.removeTypingUser(socket, typingUsers);
      //await cleanPresence();  donot remove this , this is for help to remove all socket, put due to nodemon server restart
      console.log("User disconnected:", socket.chatUserId);
    });
  });
};
