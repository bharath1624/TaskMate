import express from "express";
import Notification from "../models/notification.js";
import authMiddleware from "../middleware/auth-middleware.js";

const router = express.Router();

// get notifications
router.get("/", authMiddleware, async (req, res) => {
    const notifications = await Notification.find({
        user: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(notifications);
});


// mark ALL as read
router.patch("/read", authMiddleware, async (req, res) => {
    await Notification.updateMany(
        { user: req.user._id },
        { isRead: true }
    );
    res.json({ success: true });
});

// mark ONE as read
router.patch("/:id/read", authMiddleware, async (req, res) => {
    const { id } = req.params;

    await Notification.findOneAndUpdate(
        { _id: id, user: req.user._id },
        { isRead: true }
    );

    res.json({ success: true });
});
router.delete("/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;

    await Notification.findOneAndDelete({
        _id: id,
        user: req.user._id, // security check
    });

    res.json({ success: true });
});


export default router;
