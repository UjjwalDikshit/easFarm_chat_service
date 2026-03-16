const {client:redis} = require('../../config/redis');

async function cleanPresence() {
  const keys = await redis.keys("presence:user:*");

  if (keys.length > 0) {
    await redis.del(keys);
  }

  console.log("Presence keys cleared");
}

module.exports = cleanPresence;