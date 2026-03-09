const jwt = require("jsonwebtoken");
const User = require("../../models/user");

module.exports = async (socket, next) => {
  try {

    /*
    ==========================
    1️⃣ EXTRACT TOKEN
    ==========================
    */

    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1] ||
      socket.handshake.headers?.cookie
        ?.split("; ")
        .find((c) => c.startsWith("token="))
        ?.split("=")[1];

    if (!token) {
      return next(new Error("Authentication error: Token missing"));
    }

    /*
    ==========================
    2️⃣ VERIFY JWT
    ==========================
    */

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return next(new Error("Authentication error: Invalid token"));
    }

    if (!decoded?._id) {
      return next(new Error("Authentication error: Invalid payload"));
    }

    /*
    ==========================
    3️⃣ FIND CHAT USER
    ==========================
    */

    const user = await User.findOne({ user_id: decoded._id })
      .select("_id name email status isBlocked")
      .lean();

    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    /*
    ==========================
    4️⃣ BLOCK CHECK
    ==========================
    */

    if (user.isBlocked) {
      return next(new Error("Access denied: User blocked"));
    }

    /*
    ==========================
    5️⃣ ATTACH USER TO SOCKET
    ==========================
    */

    socket.chatUserId = user._id.toString();
    socket.user = user;

    next();

  } catch (error) {
    console.error("Socket Auth Error:", error);
    return next(new Error("Authentication failed"));
  }
};
