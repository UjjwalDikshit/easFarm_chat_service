const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const getUserConversations = require('../controllers/mything')

// POST /user/grp/create
router.get("/fetch",authMiddleware, getUserConversations);


module.exports = router;