const express = require("express");
const router = express.Router();

const conversationCreation = require("../controllers/conversationCreation");
const authMiddleware = require("../middleware/authMiddleware");
const UserCreation = require('../controllers/userCreation');
const {addMember,joinViaInvite} = require('../controllers/JoinAndAddMember');
const {getInviteLink} = require("../controllers/getInviteLink");
const { leaveGroup , removeMember} = require("../controllers/LeaveAndRemoveMember");

// POST /user/grp/create
router.post('/create',UserCreation);
router.post("/conversation/create",authMiddleware, conversationCreation);
router.post("/conversation/addMember",authMiddleware,addMember)
router.post("/conversation/joinViaInvite",authMiddleware,joinViaInvite)
router.delete("/conversation/leaveanddelete",authMiddleware,leaveGroup);
router.delete("/conversation/removeMember",authMiddleware,removeMember)
router.get("/conversations/:conversationId/invite-link",authMiddleware,getInviteLink);

module.exports = router;