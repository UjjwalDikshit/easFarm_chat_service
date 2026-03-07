const express = require("express");
const router = express.Router();

const conversationCreation = require("../controllers/conversationCreation");
const authMiddleware = require("../middleware/authMiddleware");
const UserCreation = require('../controllers/userCreation');

// POST /user/grp/create
router.post('/create',UserCreation);
router.post("/conversation/create",authMiddleware, conversationCreation);

module.exports = router;