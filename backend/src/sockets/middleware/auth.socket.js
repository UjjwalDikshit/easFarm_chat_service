const jwt = require("jsonwebtoken");
const User = require("../../models/user");

module.exports = async (socket, next) => {
    try {
        //Extract token safely
        const token =
            socket.handshake.auth?.token ||
            socket.handshake.headers?.authorization?.split(" ")[1];

        if (!token) {
            return next(new Error("Authentication error: Token missing"));
        }

        let decoded;
        try {// put jwt_secret in env file
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return next(new Error("Authentication error: Invalid token"));
        }


        if (!decoded?.id) {
            return next(new Error("Authentication error: Invalid payload"));
        }

        // 4️⃣ Fetch user from database
        const user = await User.findById(decoded.id)
            .select("_id name email status isBlocked") // check this from login page of easFarm
            .lean();

        if (!user) {
            return next(new Error("Authentication error: User not found"));
        }

        // 5️⃣ Optional: Check if user is blocked
        if (user.isBlocked) {
            return next(new Error("Access denied: User blocked"));
        }

        // 6️⃣ Attach user data to socket
        socket.userId = user._id.toString();
        socket.user = user;

        // 7️⃣ Continue connection
        next();

    } catch (error) {
        console.error("Socket Auth Error:", error);
        return next(new Error("Authentication failed"));
    }
};