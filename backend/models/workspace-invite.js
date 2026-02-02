import mongoose from "mongoose";

const workspaceInviteSchema = new mongoose.Schema(
    {
        // OPTIONAL: user exists only AFTER signup
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        // REQUIRED: invite is tied to workspace
        workspaceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
        },

        // REQUIRED: email is the core identifier
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        token: {
            type: String,
            required: true,
            unique: true,
        },

        role: {
            type: String,
            enum: ["admin", "member", "viewer"],
            default: "member",
        },

        status: {
            type: String,
            enum: ["pending", "accepted", "expired"],
            default: "pending",
        },

        expiresAt: {
            type: Date,
            required: true,
        },
    },
    { timestamps: true }
);

const WorkspaceInvite = mongoose.model(
    "WorkspaceInvite",
    workspaceInviteSchema
);

export default WorkspaceInvite;
