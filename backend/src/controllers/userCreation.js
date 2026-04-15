const ChatUser = require("../models/user");
const jwt = require("jsonwebtoken");

const userCreation = async (req, res) => {
  try {
    const { uniqueId, name, avatar } = req.body;
    const { token } = req.cookies;

    let payload;

    //  Verify JWT
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    const userId = payload._id;

    /*
    =============================
    VALIDATION
    =============================
    */
    if (!uniqueId) {
      return res.status(400).json({
        success: false,
        message: "uniqueId is required",
      });
    }

    /*
    =============================
    1️ CHECK: USER ALREADY HAS ACCOUNT
    =============================
    */
    const existingByUser = await ChatUser.findOne({ user_id: userId });

    if (existingByUser) {
      return res.status(200).json({
        success: true, //  important (treat as usable)
        message: "User already exists",
        chatUserId: existingByUser._id,
      });
    }

    /*
    =============================
    2️ CHECK: UNIQUE ID TAKEN
    =============================
    */
    const existingUnique = await ChatUser.findOne({ uniqueId });

    if (existingUnique) {
      return res.status(400).json({
        success: false,
        message: "Unique ID already taken",
      });
    }

    /*
    =============================
    CREATE NEW USER
    =============================
    */
    const newUser = await ChatUser.create({
      uniqueId,
      user_id: userId,
      name,
      avatar,
      lastSeen: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      chatUserId: newUser._id,
    });

  } catch (error) {
    console.error("User creation error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create user",
    });
  }
};

module.exports = userCreation;