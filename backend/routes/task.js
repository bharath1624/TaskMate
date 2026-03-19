import authMiddleware from "../middleware/auth-middleware.js";
import express from "express";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";
import { taskSchema } from "../libs/validate-schema.js";
import { uploadAttachment } from "../libs/cloudinary.js";
import { achievedTask, addComment, addSubTask, addTaskAttachment, createTask, deleteTask, deleteTaskAttachment, deleteTimeLog, getActivityByResourceId, getCommentsByTaskId, getMyTasks, getTaskById, getTimeLogs, startTimer, stopTimer, updateSubTask, updateTaskAssignees, updateTaskDescription, updateTaskPriority, updateTaskStatus, updateTaskTitle, watchTask } from "../controllers/task.js";

const router = express.Router();

router.post(
    "/:projectId/create-task",
    authMiddleware,
    validateRequest({
        params: z.object({
            projectId: z.string(),
        }),
        body: taskSchema,
    }),
    createTask
);

router.post(
    "/:taskId/add-subtask",
    authMiddleware,
    validateRequest({
        params: z.object({ taskId: z.string() }),
        body: z.object({ title: z.string() }),
    }),
    addSubTask
);

router.post(
    "/:taskId/add-comment",
    authMiddleware,
    validateRequest({
        params: z.object({ taskId: z.string() }),
        body: z.object({ text: z.string() }),
    }),
    addComment
);

router.post(
    "/:taskId/watch",
    authMiddleware,
    validateRequest({
        params: z.object({ taskId: z.string() }),
    }),
    watchTask
);

router.post(
    "/:taskId/achieved",
    authMiddleware,
    validateRequest({
        params: z.object({ taskId: z.string() }),
    }),
    achievedTask
);
router.put(
    "/:taskId/update-subtask/:subTaskId",
    authMiddleware,
    validateRequest({
        params: z.object({ taskId: z.string(), subTaskId: z.string() }),
        body: z.object({ completed: z.boolean() }),
    }),
    updateSubTask
);

router.put(
    "/:taskId/title",
    authMiddleware,
    validateRequest({
        params: z.object({ taskId: z.string() }),
        body: z.object({ title: z.string() }),
    }),
    updateTaskTitle
);

router.put(
    "/:taskId/description",
    authMiddleware,
    validateRequest({
        params: z.object({ taskId: z.string() }),
        body: z.object({ description: z.string() }),
    }),
    updateTaskDescription
);

router.put(
    "/:taskId/status",
    authMiddleware,
    validateRequest({
        params: z.object({ taskId: z.string() }),
        body: z.object({ status: z.string() }),
    }),
    updateTaskStatus
);

router.put(
    "/:taskId/assignees",
    authMiddleware,
    validateRequest({
        params: z.object({ taskId: z.string() }),
        body: z.object({ assignees: z.array(z.string()) }),
    }),
    updateTaskAssignees
);
router.delete(
    "/:taskId",
    authMiddleware,
    validateRequest({
        params: z.object({ taskId: z.string() }),
    }),
    deleteTask
);

router.get("/my-tasks", authMiddleware, getMyTasks);
router.put(
    "/:taskId/priority",
    authMiddleware,
    validateRequest({
        params: z.object({ taskId: z.string() }),
        body: z.object({ priority: z.string() }),
    }),
    updateTaskPriority
);

router.get(
    "/:taskId",
    authMiddleware,
    validateRequest({
        params: z.object({
            taskId: z.string(),
        }),
    }),
    getTaskById
);

router.get(
    "/:resourceId/activity",
    authMiddleware,
    validateRequest({
        params: z.object({ resourceId: z.string() }),
    }),
    getActivityByResourceId
);
router.get(
    "/:taskId/comments",
    authMiddleware,
    validateRequest({
        params: z.object({ taskId: z.string() }),
    }),
    getCommentsByTaskId
);
// ➕ Add attachment (file or URL)
const handleAttachmentUpload = (req, res, next) => {
    uploadAttachment.single("file")(req, res, (err) => {
        if (!err) return next();
        // File too large
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(413).json({
                message: "File too large. Maximum size is 10 MB.",
            });
        }
        // Wrong file type (from fileFilter)
        if (err.message) {
            return res.status(415).json({ message: err.message });
        }
        next(err);
    });
};
router.post(
    "/:taskId/attachments",
    authMiddleware,
    handleAttachmentUpload,
    validateRequest({
        params: z.object({ taskId: z.string() }),
        body: z.object({
            type: z.enum(["file", "url"]),
            fileName: z.string().optional(),
            fileUrl: z.string().optional(),
        }),
    }),
    addTaskAttachment
);

// ❌ Delete attachment
router.delete(
    "/:taskId/attachments/:attachmentId",
    authMiddleware,
    validateRequest({
        params: z.object({
            taskId: z.string(),
            attachmentId: z.string(),
        }),
    }),
    deleteTaskAttachment
);
// Add this before export default router;
router.put(
    "/:taskId/read",
    authMiddleware,
    // (Optional: add validation if you want)
    validateRequest({
        params: z.object({ taskId: z.string() }),
    }),
    // You must import this controller function
    (req, res, next) => {
        // Dynamic import or ensure it is imported at the top
        import("../controllers/task.js").then(c => c.markCommentsAsRead(req, res)).catch(next);
    }
);
router.post(
    "/:taskId/time/start",
    authMiddleware,
    validateRequest({ params: z.object({ taskId: z.string() }) }),
    startTimer
);

// Stop running timer for a task
router.post(
    "/:taskId/time/stop",
    authMiddleware,
    validateRequest({
        params: z.object({ taskId: z.string() }),
        body: z.object({ note: z.string().optional() }),
    }),
    stopTimer
);

// Get all time logs for a task
router.get(
    "/:taskId/time",
    authMiddleware,
    validateRequest({ params: z.object({ taskId: z.string() }) }),
    getTimeLogs
);

// Delete a specific time log
router.delete(
    "/:taskId/time/:logId",
    authMiddleware,
    validateRequest({
        params: z.object({ taskId: z.string(), logId: z.string() }),
    }),
    deleteTimeLog
);
export default router;