const express = require("express");
const router = express.Router();

const conversationCreation = require("../controllers/conversationCreation");
const authMiddleware = require("../middleware/authMiddleware");
const UserCreation = require('../controllers/userCreation');
const {addMembers,joinViaInvite} = require('../controllers/JoinAndAddMember')

// POST /user/grp/create
router.post('/create',UserCreation);
router.post("/conversation/create",authMiddleware, conversationCreation);
router.post("/conversation/addMember",addMembers)
router.post("/conversation/joinViaInvite",joinViaInvite)

module.exports = router;