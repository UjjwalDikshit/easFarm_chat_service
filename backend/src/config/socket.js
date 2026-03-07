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

    // // Redis setup
    // const pubClient = createClient({ url: process.env.REDIS_URL });
    // const subClient = pubClient.duplicate();

    // await pubClient.connect();
    // await subClient.connect();
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