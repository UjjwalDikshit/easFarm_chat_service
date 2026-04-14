const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const getUserConversations = require('../controllers/mything')
const getAllMessageOfConversation = require('../controllers/myConversation')
const { leaveGroup, removeMember } = require("../controllers/LeaveAndRemoveMember")
// POST /user/grp/create
router.get("/fetch",authMiddleware, getUserConversations);
router.get("/getUserConversation",getAllMessageOfConversation);//authMiddleware
router.get("/user/removeMember",removeMember);

module.exports = router;