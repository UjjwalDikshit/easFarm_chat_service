const { conversationMember } = require("../models/conversation");

async function getUserConversations(userId) {

  const memberships = await conversationMember
    .find({ userId })
    .select("conversationId");

  return memberships.map(m => m.conversationId.toString());
}

module.exports = getUserConversations;