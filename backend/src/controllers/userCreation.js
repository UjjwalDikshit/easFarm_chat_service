const ChatUser = require("../models/user");
const jwt = require("jsonwebtoken");

const userCreation = async (req, res) => {
  try {
    const { uniqueId, name, avatar } = req.body;
    const {token} = req.cookies;
    let payload;

    try {
       payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        err:error,
        success: false,
        error: "Wrong credentials or invalid token",
      });
    }
    /*
    =============================
    BASIC VALIDATION
    =============================
    */

    if (!uniqueId) {
      return res.status(400).json({
        success: false,
        error: "uniqueId is required",
      });
    }

    /*
    =============================
    CHECK IF USER EXISTS
    =============================
    */

    let existingUser = await ChatUser.findOne({ uniqueId });

    if (existingUser) {
      return res.status(200).json({
        success: false,
        message: "User already exists",
        // data: existingUser
      });
    }

    /*
    =============================
    CREATE NEW USER
    =============================
    */

    const newUser = await ChatUser.create({
      uniqueId,
      user_id:payload._id,
      name,
      avatar,
      lastSeen: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: newUser,
    });
  } catch (error) {
    console.error("User creation error:", error);

    return res.status(500).json({
      success: false,
      error: "Failed to create user",
    });
  }
};

module.exports = userCreation;
