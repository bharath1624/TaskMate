import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        title: {
            type: String,
            required: true,
        },

        message: {
            type: String,
            required: true,
        },

        isRead: {
            type: Boolean,
            default: false,
        },

        // 🔽 REQUIRED FOR NAVIGATION
        targetType: {
            type: String,
            enum: ["task", "project"],
            required: true,
        },

        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },

        projectId: {
            type: mongoose.Schema.Types.ObjectId,
        },

        workspaceId: {
            type: mongoose.Schema.Types.ObjectId,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Notification", NotificationSchema);
