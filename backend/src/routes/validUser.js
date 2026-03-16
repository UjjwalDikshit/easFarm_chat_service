const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const checkMe = require('../controllers/checkMe')

// POST /user/grp/create
router.get("/user",authMiddleware, checkMe);


module.exports = router;