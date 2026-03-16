const { createClient } = require("redis");

const client = createClient({
  username: "default",
  password: process.env.REDIS_PASS,
  socket: {
    host: "redis-14923.crce217.ap-south-1-1.ec2.cloud.redislabs.com",
    port: 14923,
    connectTimeout: 10000, // Wait 10s for initial connection
    keepAlive: 5000, // TCP probe every 5s to prevent idle timeout
    reconnectStrategy: (retries, cause) => {
      if (retries > 20) {
        console.error("Redis: Max reconnection attempts reached. Giving up.");
        return new Error("Redis connection failed"); // Stop retrying
      }

      // Exponential backoff: 50ms, 100ms, 200ms... up to 3000ms
      const delay = Math.min(Math.pow(2, retries) * 50, 3000);
      return delay;
    },
  },
  pingInterval: 30000, // Application-level PING every 30s
});

client.on("error", (err) => console.error("Redis Client Error:", err));

// Self-invoking connection logic or explicit connect function
const connectRedis = async () => {
  if (!client.isOpen) {
    await client.connect();
    console.log("Connected to Redis");
  }
  return client;
};

// Wrapper functions for easy use
const redisStore = {
  setInSet: async (key, value) => {
    await connectRedis();
    return await client.sAdd(key, value);
  },
  // get: async (key) => {
  //     await connectRedis();
  //     return await client.get(key);
  // },
  getCountOfSet: async (key) => {
    await connectRedis();
    return await client.sCard(key);
  },
  // Check Time To Live (-2: dead, -1: permanent, >0: seconds left)
  ttl: async (key) => {
    await ensureConnection();
    return await client.ttl(key);
  },

  // Remove expiration and make key permanent
  persist: async (key) => {
    await ensureConnection();
    return await client.persist(key);
  },

  // Manual Delete
  del: async (key) => {
    await ensureConnection();
    return await client.del(key);
  },
};

const pub = client.duplicate();
const sub = client.duplicate();

client.on("error", console.error);
pub.on("error", console.error);
sub.on("error", console.error);




module.exports = { client, redisStore, connectRedis, pub, sub };

/*
SADD
and SET are commands used for entirely different data types and purposes in Redis: SADD is for managing elements in a Set (an unordered collection of unique strings), while SET is for storing and retrieving a simple String key-value pair.
*/
