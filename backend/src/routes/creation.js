const express = require("express");
const router = express.Router();

const conversationCreation = require("../controllers/conversationCreation");
const authMiddleware = require("../middleware/authMiddleware");
const UserCreation = require('../controllers/userCreation');
const {addMember,joinViaInvite} = require('../controllers/JoinAndAddMember')

// POST /user/grp/create
router.post('/create',UserCreation);
router.post("/conversation/create",authMiddleware, conversationCreation);
router.post("/conversation/addMember",authMiddleware,addMember)
router.post("/conversation/joinViaInvite",authMiddleware,joinViaInvite)

module.exports = router;