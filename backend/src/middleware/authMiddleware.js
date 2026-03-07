const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/user");

const authMiddleware = async (req, res, next) => {
  try {
    /* ===============================
       EXTRACT TOKEN FROM COOKIES
    =============================== */
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Access denied. No token provided.",
      });
    }

    /* ===============================
       VERIFY TOKEN
    =============================== */
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          error: "Session expired. Please login again.",
        });
      }

      return res.status(401).json({
        success: false,
        error: "Invalid token.",
      });
    }

    /* ===============================
       VALIDATE USER ID FORMAT
    =============================== */
    if (!mongoose.Types.ObjectId.isValid(decoded._id)) {
      console.log(decoded._id);
      return res.status(401).json({
        success: false,
        error: "Invalid user ID.",
      });
    }

    /* ===============================
       FETCH USER FROM DATABASE
    =============================== */
    const user = await User.findOne({ user_id: decoded._id }).lean()
      .select("_id name uniqueId isBanned isDeleted")
      .lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found.",
      });
    }
    console.log(user);
    /* ===============================
       CHECK USER STATUS
    =============================== */

    if (user.isDeleted) {
      return res.status(403).json({
        success: false,
        error: "Account has been deleted.",
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        error: "Account has been banned.",
      });
    }

    /* ===============================
       ATTACH USER TO REQUEST
    =============================== */
    req.user = user;

    /* ===============================
       PROCEED TO NEXT MIDDLEWARE
    =============================== */
    next();

  } catch (error) {
    console.error("Auth middleware error:", error);

    return res.status(500).json({
      success: false,
      error: "Internal authentication error.",
    });
  }
};

module.exports = authMiddleware;