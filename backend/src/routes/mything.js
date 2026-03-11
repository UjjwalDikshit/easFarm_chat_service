const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const getUserConversations = require('../controllers/mything')
const getAllMessageOfConversation = require('../controllers/myConversation')
// POST /user/grp/create
router.get("/fetch",authMiddleware, getUserConversations);
router.get("/getUserConversation",getAllMessageOfConversation);//authMiddleware

module.exports = router;