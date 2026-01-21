import jwt from "jsonwebtoken";
import User from "../models/user.js";

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]; //Bearer dhghjhdkjfg

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Token expired",
            });
        }

        return res.status(401).json({
            message: "Unauthorized",
        });
    }

};

export default authMiddleware;