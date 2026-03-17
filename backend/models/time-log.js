import mongoose, { Schema } from "mongoose";

/**
 * TimeLog Model
 * Each document = one work session on a task.
 * A session can be "running" (no endTime) or "completed" (has endTime + duration).
 */
const timeLogSchema = new Schema(
    {
        task: {
            type: Schema.Types.ObjectId,
            ref: "Task",
            required: true,
            index: true,
        },
        project: {
            type: Schema.Types.ObjectId,
            ref: "Project",
            required: true,
            index: true,
        },
        workspace: {
            type: Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
            index: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        startTime: {
            type: Date,
            required: true,
        },
        endTime: {
            type: Date,
            default: null, // null = timer is still running
        },
        // Duration stored in seconds for precision
        duration: {
            type: Number,
            default: 0, // populated when timer is stopped
        },
        note: {
            type: String,
            trim: true,
            default: "",
        },
        isManual: {
            type: Boolean,
            default: false, // true if user typed hours manually
        },
    },
    { timestamps: true }
);

// Virtual: is the timer currently running?
timeLogSchema.virtual("isRunning").get(function () {
    return this.endTime === null || this.endTime === undefined;
});

const TimeLog = mongoose.model("TimeLog", timeLogSchema);

export default TimeLog;
