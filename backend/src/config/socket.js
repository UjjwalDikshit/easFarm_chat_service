const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");
const socketConnection = require("../sockets/connection");

let io;

async function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: "*",
        }
    });

    console.log('socket server created');
    // io.adapter(createAdapter(pubClient, subClient));

    socketConnection(io);
}

function getIO() {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
}

module.exports = { initSocket, getIO };