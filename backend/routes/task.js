import authMiddleware from "../middleware/auth-middleware.js";
import express from "express";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";
import { taskSchema } from "../libs/validate-schema.js";
import attachement from "../middleware/attachment.js";
import { achievedTask, addComment, addSubTask, addTaskAttachment, createTask, deleteTask, deleteTaskAttachment, getActivityByResourceId, getCommentsByTaskId, getMyTasks, getTaskById, updateSubTask, updateTaskAssignees, updateTaskDescription, updateTaskPriority, updateTaskStatus, updateTaskTitle, watchTask } from "../controllers/task.js";

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
router.post(
    "/:taskId/attachments",
    authMiddleware,
    attachement.single("file"), // 👈 MULTER HERE
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


export default router;