import jwt from "jsonwebtoken";
import User from "../models/user.js";

const optionalAuthMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        req.user = null;
        return next();
    }

    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 🔥 FIX: Check for 'userId', 'id', or '_id' to match however you signed the token
        const userId = decoded.userId || decoded.id || decoded._id;

        if (!userId) {
            req.user = null;
            return next();
        }

        const user = await User.findById(userId).select("-password");
        req.user = user || null;

        next();
    } catch (error) {
        // Token expired or invalid
        req.user = null;
        next();
    }
};

export default optionalAuthMiddleware;