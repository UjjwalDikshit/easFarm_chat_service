const { Server } = require("socket.io");
const socketConnection = require("../sockets/connection");

let io;

function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: "*",
        }
    });

    socketConnection(io);
}

function getIO() {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
}

module.exports = initSocket;
module.exports.getIO = getIO;


/*
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

await pubClient.connect();
await subClient.connect();

io.adapter(createAdapter(pubClient, subClient)); */