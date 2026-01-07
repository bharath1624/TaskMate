
import express from "express";
import authenticateUser from "../middleware/auth-middleware.js";
import {
    changePassword,
    getUserProfile,
    updateUserProfile,
} from "../controllers/user.js";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";
import upload from "../middleware/upload-middleware.js";


const router = express.Router();
router.get("/profile", authenticateUser, getUserProfile);

router.put(
    "/profile",
    authenticateUser,
    upload.single("avatar"),   // ✅ Multer FIRST
    updateUserProfile          // ✅ Controller
);

router.put(
    "/change-password",
    authenticateUser,
    validateRequest({
        body: z.object({
            currentPassword: z.string(),
            newPassword: z.string(),
            confirmPassword: z.string(),
        }),
    }),
    changePassword
);

export default router;
