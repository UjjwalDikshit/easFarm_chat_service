const { Server } = require("socket.io");
const socketConnection = require("../sockets/connection");
const { createAdapter } = require("@socket.io/redis-adapter");
const {pub,sub} = require('./redis');
let io;

async function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: "*",
        },
        adapter: createAdapter(pub, sub)
    });

    console.log('socket server created');
    socketConnection(io);
}

function getIO() {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
}

module.exports = { initSocket, getIO };