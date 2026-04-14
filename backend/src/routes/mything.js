const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const getUserConversations = require('../controllers/mything')
const getAllMessageOfConversation = require('../controllers/myConversation')
const {getConversationMembers} = require('../controllers/viewMembers');

// POST /user/grp/create
router.get("/fetch",authMiddleware, getUserConversations);
router.get("/getUserConversation",getAllMessageOfConversation);//authMiddleware
router.get("/conversation/:conversationId/members",authMiddleware,getConversationMembers);

module.exports = router;