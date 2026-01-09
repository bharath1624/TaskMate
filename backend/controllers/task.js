
import Project from "../models/project.js";
import Task from "../models/task.js";
import Workspace from "../models/workspace.js";
import ActivityLog from "../models/activity.js";
import Comment from "../models/comment.js";
import { recordActivity } from "../libs/index.js";
import Notification from "../models/notification.js";
import { io } from "../index.js";
import mongoose from "mongoose";

const createTask = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { title, description, status, priority, dueDate, assignees } =
            req.body;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        const workspace = await Workspace.findById(project.workspace);

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found",
            });
        }

        const isMember = workspace.members.some(
            (member) => member.user.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                message: "You are not a member of this workspace",
            });
        }
        console.log("📦 Incoming assignees:", assignees);
        const normalizedAssignees = Array.isArray(assignees)
            ? assignees
            : assignees
                ? [assignees]
                : [];


        const newTask = await Task.create({
            title,
            description,
            status,
            priority,
            dueDate,
            assignees: normalizedAssignees,
            project: projectId,
            createdBy: req.user._id,
        });
        project.tasks.push(newTask._id);
        await project.save();
        // 🔔 NOTIFY ASSIGNEES (REAL-TIME + DB)
        if (normalizedAssignees.length > 0) {
            // 🔔 NOTIFY ASSIGNEES (DB + REAL-TIME)
            for (const userId of normalizedAssignees) {
                await Notification.create({
                    user: userId,
                    title: "Task assigned",
                    message: `You were assigned to task "${newTask.title}"`,
                    targetType: "task",
                    targetId: newTask._id,
                    projectId: project._id,
                    workspaceId: workspace._id,
                });

                io.to(userId.toString()).emit("notification", {
                    title: "Task assigned",
                    message: `You were assigned to task "${newTask.title}"`,
                    targetType: "task",
                    targetId: newTask._id,
                    projectId: project._id,
                    workspaceId: workspace._id,
                });

                console.log("📢 Notification emitted to:", userId.toString());
            }

        }


        res.status(201).json(newTask);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

const getTaskById = async (req, res) => {
    try {
        const { taskId } = req.params;

        const task = await Task.findById(taskId)
            .populate("assignees", "name profilePicture")
            .populate("watchers", "name profilePicture");

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        const project = await Project.findById(task.project).populate(
            "members.user",
            "name profilePicture"
        );

        res.status(200).json({ task, project });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

const updateTaskTitle = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { title } = req.body;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        const project = await Project.findById(task.project);

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        const isMember = project.members.some(
            (member) => member.user.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                message: "You are not a member of this project",
            });
        }

        const oldTitle = task.title;

        task.title = title;
        await task.save();

        // record activity
        await recordActivity(req.user._id, "updated_task", "Task", taskId, {
            description: `updated task title from ${oldTitle} to ${title}`,
        });

        res.status(200).json(task);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

const updateTaskDescription = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { description } = req.body;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        const project = await Project.findById(task.project);

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        const isMember = project.members.some(
            (member) => member.user.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                message: "You are not a member of this project",
            });
        }

        const oldDescription =
            task.description.substring(0, 50) +
            (task.description.length > 50 ? "..." : "");
        const newDescription =
            description.substring(0, 50) + (description.length > 50 ? "..." : "");

        task.description = description;
        await task.save();

        // record activity
        await recordActivity(req.user._id, "updated_task", "Task", taskId, {
            description: `updated task description from ${oldDescription} to ${newDescription}`,
        });

        res.status(200).json(task);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

const updateTaskStatus = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        const project = await Project.findById(task.project);

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        const isMember = project.members.some(
            (member) => member.user.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                message: "You are not a member of this project",
            });
        }

        const oldStatus = task.status;

        task.status = status;
        await task.save();

        // record activity
        await recordActivity(req.user._id, "updated_task", "Task", taskId, {
            description: `updated task status from ${oldStatus} to ${status}`,
        });

        res.status(200).json(task);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

const updateTaskAssignees = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { assignees } = req.body;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        const project = await Project.findById(task.project);

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        const isMember = project.members.some(
            (member) => member.user.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                message: "You are not a member of this project",
            });
        }

        const oldAssignees = task.assignees;

        task.assignees = assignees;
        await task.save();

        // record activity
        await recordActivity(req.user._id, "updated_task", "Task", taskId, {
            description: `updated task assignees from ${oldAssignees.length} to ${assignees.length}`,
        });

        res.status(200).json(task);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

const updateTaskPriority = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { priority } = req.body;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        const project = await Project.findById(task.project);

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        const isMember = project.members.some(
            (member) => member.user.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                message: "You are not a member of this project",
            });
        }

        const oldPriority = task.priority;

        task.priority = priority;
        await task.save();

        // record activity
        await recordActivity(req.user._id, "updated_task", "Task", taskId, {
            description: `updated task priority from ${oldPriority} to ${priority}`,
        });

        res.status(200).json(task);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

const addSubTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { title } = req.body;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        const project = await Project.findById(task.project);

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        const isMember = project.members.some(
            (member) => member.user.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                message: "You are not a member of this project",
            });
        }

        const newSubTask = {
            title,
            completed: false,
        };

        task.subtasks.push(newSubTask);
        await task.save();

        // record activity
        await recordActivity(req.user._id, "created_subtask", "Task", taskId, {
            description: `created subtask ${title}`,
        });

        res.status(201).json(task);
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

const updateSubTask = async (req, res) => {
    try {
        const { taskId, subTaskId } = req.params;
        const { completed } = req.body;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        const subTask = task.subtasks.find(
            (subTask) => subTask._id.toString() === subTaskId
        );

        if (!subTask) {
            return res.status(404).json({
                message: "Subtask not found",
            });
        }

        subTask.completed = completed;
        await task.save();

        // record activity
        await recordActivity(req.user._id, "updated_subtask", "Task", taskId, {
            description: `updated subtask ${subTask.title}`,
        });

        res.status(200).json(task);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

const getActivityByResourceId = async (req, res) => {
    try {
        const { resourceId } = req.params;

        const activity = await ActivityLog.find({ resourceId })
            .populate("user", "name profilePicture")
            .sort({ createdAt: -1 });

        res.status(200).json(activity);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

const getCommentsByTaskId = async (req, res) => {
    try {
        const { taskId } = req.params;

        const comments = await Comment.find({ task: taskId })
            .populate("author", "name profilePicture")
            .sort({ createdAt: -1 });

        res.status(200).json(comments);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

const addComment = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { text } = req.body;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        const project = await Project.findById(task.project);

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        const isMember = project.members.some(
            (member) => member.user.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                message: "You are not a member of this project",
            });
        }

        const newComment = await Comment.create({
            text,
            task: taskId,
            author: req.user._id,
        });

        task.comments.push(newComment._id);
        await task.save();

        // record activity
        await recordActivity(req.user._id, "added_comment", "Task", taskId, {
            description: `added comment ${text.substring(0, 50) + (text.length > 50 ? "..." : "")
                }`,
        });

        res.status(201).json(newComment);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};
const watchTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        const project = await Project.findById(task.project);

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        const isMember = project.members.some(
            (member) => member.user.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                message: "You are not a member of this project",
            });
        }

        const isWatching = task.watchers.includes(req.user._id);

        if (!isWatching) {
            task.watchers.push(req.user._id);
        } else {
            task.watchers = task.watchers.filter(
                (watcher) => watcher.toString() !== req.user._id.toString()
            );
        }

        await task.save();

        // record activity
        await recordActivity(req.user._id, "updated_task", "Task", taskId, {
            description: `${isWatching ? "stopped watching" : "started watching"
                } task ${task.title}`,
        });

        res.status(200).json(task);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

const achievedTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        const project = await Project.findById(task.project);

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        const isMember = project.members.some(
            (member) => member.user.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                message: "You are not a member of this project",
            });
        }
        const isAchieved = task.isArchived;

        task.isArchived = !isAchieved;
        await task.save();

        // record activity
        await recordActivity(req.user._id, "updated_task", "Task", taskId, {
            description: `${isAchieved ? "unachieved" : "achieved"} task ${task.title
                }`,
        });

        res.status(200).json(task);
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};
const getMyTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ assignees: { $in: [req.user._id] } })
            .populate("project", "title workspace")
            .sort({ createdAt: -1 });

        res.status(200).json(tasks);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};
const deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // remove task from project
        await Project.findByIdAndUpdate(task.project, {
            $pull: { tasks: taskId },
        });

        // delete related data
        await Comment.deleteMany({ task: taskId });
        await ActivityLog.deleteMany({ resourceId: taskId });

        // delete task
        await Task.findByIdAndDelete(taskId);

        return res.status(200).json({
            success: true,
            taskId,
            project: task.project,
        });
    } catch (error) {
        console.error("DELETE TASK ERROR:", error);
        return res.status(500).json({ message: "Delete failed" });
    }
};
const addTaskAttachment = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { type, fileName, fileUrl } = req.body;

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // permissions
        const project = await Project.findById(task.project);
        const isMember = project.members.some(
            (m) => m.user.toString() === req.user._id.toString()
        );
        if (!isMember) {
            return res.status(403).json({ message: "Not allowed" });
        }

        let attachment; // ✅ declare ONCE

        if (type === "file") {
            if (!req.file) {
                return res.status(400).json({ message: "File is required" });
            }

            attachment = {
                type: "file",
                fileName: req.file.originalname,
                fileUrl: `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`,
                fileType: req.file.mimetype,
                fileSize: req.file.size,
                uploadedBy: req.user._id,
            };

        } else {
            attachment = {
                type: "url",
                fileName,
                fileUrl,
                uploadedBy: req.user._id,
            };
        }
        if (!attachment || !attachment.fileUrl) {
            return res.status(400).json({ message: "Invalid attachment" });
        }

        task.attachments.push(attachment);
        await task.save();

        await recordActivity(req.user._id, "added_attachment", "Task", taskId, {
            description: `added attachment ${attachment.fileName}`,
        });

        res.status(201).json(task);
    } catch (error) {
        console.error("ADD ATTACHMENT ERROR:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const deleteTaskAttachment = async (req, res) => {
    try {
        const { taskId, attachmentId } = req.params;

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // permission check
        const project = await Project.findById(task.project);
        const isMember = project.members.some(
            (m) => m.user.toString() === req.user._id.toString()
        );
        if (!isMember) {
            return res.status(403).json({ message: "Not allowed" });
        }

        // ✅ DEFINE IT HERE (IMPORTANT)
        const attachmentExists = task.attachments.some(
            (att) => att && att._id && att._id.toString() === attachmentId
        );

        if (!attachmentExists) {
            return res.status(404).json({ message: "Attachment not found" });
        }

        // ✅ NULL-SAFE REMOVE
        task.attachments = task.attachments.filter(
            (att) => att && att._id && att._id.toString() !== attachmentId
        );

        await task.save();

        // activity log
        await recordActivity(req.user._id, "removed_attachment", "Task", taskId, {
            description: "removed an attachment",
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("DELETE ATTACHMENT ERROR:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export {
    createTask,
    getTaskById,
    updateTaskTitle,
    updateTaskDescription,
    updateTaskStatus,
    updateTaskAssignees,
    updateTaskPriority,
    addSubTask,
    updateSubTask,
    getActivityByResourceId,
    getCommentsByTaskId,
    addComment,
    watchTask,
    achievedTask,
    getMyTasks,
    deleteTask,
    addTaskAttachment,
    deleteTaskAttachment
};