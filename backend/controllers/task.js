
import Project from "../models/project.js";
import Task from "../models/task.js";
import Workspace from "../models/workspace.js";
import ActivityLog from "../models/activity.js";
import Comment from "../models/comment.js";
import { recordActivity } from "../libs/index.js";
import Notification from "../models/notification.js";
import TimeLog from "../models/time-log.js";
// ✅ 1. ROBUST ID HELPER
const safeId = (id) => {
    if (!id) return "";
    return (id._id || id).toString(); // Handles populated objects OR raw IDs
};

// ✅ 2. GOD MODE CHECKER
const checkTaskAccess = async (req, projectId) => {
    const userId = req.user._id.toString(); // Ensure String

    const project = await Project.findById(projectId);
    if (!project) throw new Error("Project not found");

    const workspace = await Workspace.findById(project.workspace);
    if (!workspace) throw new Error("Workspace not found");

    // A. Workspace Owner (GOD MODE)
    if (workspace.owner.toString() === userId) {
        return { project, workspace, isAuthorized: true, canEdit: true };
    }

    // B. Workspace Admin (GOD MODE)
    // iterate members and convert IDs to string safely
    const wsMember = workspace.members.find(m =>
        (m.user._id || m.user).toString() === userId
    );

    if (wsMember && (wsMember.role === "admin" || wsMember.role === "owner")) {
        return { project, workspace, isAuthorized: true, canEdit: true };
    }

    // C. Project Specific Role
    const projectMember = project.members.find(m =>
        (m.user._id || m.user).toString() === userId
    );

    if (projectMember) {
        const isProjectAdmin = projectMember.role === "admin";
        return {
            project,
            workspace,
            isAuthorized: true,
            canEdit: isProjectAdmin // Only Admins get Edit rights here
        };
    }

    return { project, workspace, isAuthorized: false, canEdit: false };
};

const createTask = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { title, description, status, priority, dueDate, assignees } = req.body;

        const { project, workspace, isAuthorized } = await checkTaskAccess(req, projectId);
        if (!isAuthorized) return res.status(403).json({ message: "Not authorized" });

        const normalizedAssignees = Array.isArray(assignees) ? assignees : (assignees ? [assignees] : []);

        const newTask = await Task.create({
            title, description, status, priority, dueDate,
            assignees: normalizedAssignees,
            project: projectId,
            createdBy: req.user._id,
        });

        project.tasks.push(newTask._id);
        await project.save();

        if (normalizedAssignees.length > 0) {
            for (const userId of normalizedAssignees) {
                if (userId.toString() === req.user._id.toString()) continue;
                await Notification.create({
                    user: userId,
                    title: "Task assigned",
                    message: `You were assigned to task "${newTask.title}"`,
                    targetType: "task",
                    targetId: newTask._id,
                    projectId: project._id,
                    workspaceId: workspace._id,
                });
                if (global.io) global.io.to(userId.toString()).emit("notification", { title: "Task assigned", message: `You were assigned to task "${newTask.title}"` });
            }
        }

        if (global.io) global.io.to(projectId).emit("task_created", newTask);

        res.status(201).json(newTask);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const getTaskById = async (req, res) => {
    try {
        const { taskId } = req.params;
        const task = await Task.findById(taskId)
            .populate("assignees", "name profilePicture")
            .populate("watchers", "name profilePicture");

        if (!task) return res.status(404).json({ message: "Task not found" });

        const { project, workspace, canEdit, isAuthorized } = await checkTaskAccess(req, task.project);

        if (!isAuthorized) return res.status(403).json({ message: "Not authorized" });

        // 1. Populate Project Members (FULL LIST)
        await project.populate("members.user", "name profilePicture");

        // 2. Populate Workspace Context
        await workspace.populate("owner", "name profilePicture");
        await workspace.populate("members.user", "name profilePicture");

        // 3. CONSOLIDATE MEMBERS (Superset: Project Members + Owner + All Admins)
        // We send everyone so the "Assign" dropdown works.
        const projectObj = project.toObject();
        const combinedMembers = [];
        const seenIds = new Set();

        const addMember = (user, role) => {
            if (!user || !user._id) return;
            const idStr = user._id.toString();
            if (!seenIds.has(idStr)) {
                seenIds.add(idStr);
                combinedMembers.push({ user, role });
            }
        };

        // A. Add ALL Project Members (Fixes: "Not showing members in assigns")
        project.members.forEach(m => addMember(m.user, m.role));

        // B. Add Workspace Owner (Fixes: "Not seeing owner name")
        addMember(workspace.owner, "owner");

        // C. Add Workspace Admins (Always mentionable)
        workspace.members.forEach(m => {
            if (m.role === 'admin') {
                addMember(m.user, "admin");
            }
        });

        projectObj.members = combinedMembers;

        res.status(200).json({
            task,
            project: projectObj,
            canEdit,
            workspaceOwner: workspace.owner
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const updateTaskTitle = async (req, res) => {
    try {
        const { taskId } = req.params; const { title } = req.body;
        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: "Task not found" });

        const { isAuthorized } = await checkTaskAccess(req, task.project);
        if (!isAuthorized) return res.status(403).json({ message: "Not authorized" });

        task.title = title;
        await task.save();
        await recordActivity(req.user._id, "updated_task", "Task", taskId, { description: `updated task title to ${title}` });

        if (global.io) global.io.to(task.project.toString()).emit("task_updated", task);
        res.status(200).json(task);
    } catch (error) { console.error(error); return res.status(500).json({ message: "Internal server error" }); }
};

const updateTaskDescription = async (req, res) => {
    try {
        const { taskId } = req.params; const { description } = req.body;
        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: "Task not found" });

        const { isAuthorized } = await checkTaskAccess(req, task.project);
        if (!isAuthorized) return res.status(403).json({ message: "Not authorized" });

        task.description = description;
        await task.save();
        await recordActivity(req.user._id, "updated_task", "Task", taskId, { description: `updated task description` });

        if (global.io) global.io.to(task.project.toString()).emit("task_updated", task);
        res.status(200).json(task);
    } catch (error) { console.error(error); return res.status(500).json({ message: "Internal server error" }); }
};

const updateTaskStatus = async (req, res) => {
    try {
        const { taskId } = req.params; const { status } = req.body;
        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: "Task not found" });

        // checkTaskAccess returns the project data we need!
        const { project, isAuthorized } = await checkTaskAccess(req, task.project);
        if (!isAuthorized) return res.status(403).json({ message: "Not authorized" });

        task.status = status;
        await task.save();
        await recordActivity(req.user._id, "updated_task", "Task", taskId, { description: `updated task status to ${status}` });

        // ================================================================
        // ✅ APPROACH 2: AUTOMATIC PROJECT COMPLETION TRIGGER
        // ================================================================
        // 1. Fetch all active tasks for this specific project
        const allTasks = await Task.find({ project: project._id, isArchived: false });

        if (allTasks.length > 0) {
            // 2. Calculate the progress exactly like the frontend does
            const completedCount = allTasks.filter(t => t.status === "Done").length;
            const progress = Math.round((completedCount / allTasks.length) * 100);

            let newProjectStatus = project.status;

            // 3. If progress hits 100%, automatically graduate it to Completed!
            if (progress === 100 && project.status !== "Completed") {
                newProjectStatus = "Completed";
            }
            // 4. (Optional but smart): If the project WAS completed, but a user 
            // moves a task backward (out of "Done"), automatically revert it to "In Progress"
            else if (progress < 100 && project.status === "Completed") {
                newProjectStatus = "In Progress";
            }

            // 5. If the status needs to change, save it to MongoDB!
            if (newProjectStatus !== project.status) {
                await Project.findByIdAndUpdate(project._id, { status: newProjectStatus });

                // (Optional) Emit a socket event to update the workspace dashboard in real-time
                if (global.io && project.workspace) {
                    global.io.to(project.workspace.toString()).emit("project_updated", {
                        projectId: project._id,
                        status: newProjectStatus
                    });
                }
            }
        }
        // ================================================================

        if (global.io) global.io.to(task.project.toString()).emit("task_updated", task);
        res.status(200).json(task);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const updateTaskAssignees = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { assignees } = req.body;

        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: "Task not found" });

        const { isAuthorized } = await checkTaskAccess(req, task.project);
        if (!isAuthorized)
            return res.status(403).json({ message: "Not authorized" });

        // ✅ 1. Store OLD assignees
        const oldAssignees = task.assignees.map(id => id.toString());

        // ✅ 2. Normalize new assignees
        const newAssignees = Array.isArray(assignees)
            ? assignees.map(id => id.toString())
            : [];

        // ✅ 3. Update task
        task.assignees = newAssignees;
        await task.save();

        // ✅ 4. Detect ONLY newly added users
        const addedUsers = newAssignees.filter(
            id => !oldAssignees.includes(id)
        );

        // ✅ 5. Send notification (skip self)
        for (const userId of addedUsers) {
            if (userId === req.user._id.toString()) continue; // ❌ Skip self

            await Notification.create({
                user: userId,
                title: "Task assigned",
                message: `You were assigned to task "${task.title}"`,
                targetType: "task",
                targetId: task._id,
                projectId: task.project,
            });

            if (global.io) {
                global.io.to(userId).emit("notification", {
                    title: "Task assigned",
                    message: `You were assigned to task "${task.title}"`,
                });
            }
        }

        await recordActivity(
            req.user._id,
            "updated_task",
            "Task",
            taskId,
            { description: `updated task assignees` }
        );

        if (global.io)
            global.io.to(task.project.toString()).emit("task_updated", task);

        res.status(200).json(task);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const updateTaskPriority = async (req, res) => {
    try {
        const { taskId } = req.params; const { priority } = req.body;
        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: "Task not found" });

        const { isAuthorized } = await checkTaskAccess(req, task.project);
        if (!isAuthorized) return res.status(403).json({ message: "Not authorized" });

        task.priority = priority;
        await task.save();
        await recordActivity(req.user._id, "updated_task", "Task", taskId, { description: `updated task priority to ${priority}` });

        if (global.io) global.io.to(task.project.toString()).emit("task_updated", task);
        res.status(200).json(task);
    } catch (error) { console.error(error); return res.status(500).json({ message: "Internal server error" }); }
};

const addSubTask = async (req, res) => {
    try {
        const { taskId } = req.params; const { title } = req.body;
        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: "Task not found" });

        const { isAuthorized } = await checkTaskAccess(req, task.project);
        if (!isAuthorized) return res.status(403).json({ message: "Not authorized" });

        task.subtasks.push({ title, completed: false });
        await task.save();
        await recordActivity(req.user._id, "created_subtask", "Task", taskId, { description: `created subtask ${title}` });

        if (global.io) global.io.to(task.project.toString()).emit("task_updated", task);
        res.status(201).json(task);
    } catch (error) { console.error(error); return res.status(500).json({ message: "Internal server error" }); }
};

const updateSubTask = async (req, res) => {
    try {
        const { taskId, subTaskId } = req.params; const { completed } = req.body;
        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: "Task not found" });

        const subTask = task.subtasks.find(st => st._id.toString() === subTaskId);
        if (!subTask) return res.status(404).json({ message: "Subtask not found" });

        subTask.completed = completed;
        await task.save();
        await recordActivity(req.user._id, "updated_subtask", "Task", taskId, { description: `updated subtask ${subTask.title}` });

        if (global.io) global.io.to(task.project.toString()).emit("task_updated", task);
        res.status(200).json(task);
    } catch (error) { console.error(error); return res.status(500).json({ message: "Internal server error" }); }
};

const deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: "Task not found" });

        const { canEdit } = await checkTaskAccess(req, task.project);
        // Only Admins/Owners (who have canEdit=true) can delete
        if (!canEdit) return res.status(403).json({ message: "Only Admins can delete tasks" });

        const projectId = task.project.toString();
        await Project.findByIdAndUpdate(projectId, { $pull: { tasks: taskId } });
        await Comment.deleteMany({ task: taskId });
        await ActivityLog.deleteMany({ resourceId: taskId });
        await Task.findByIdAndDelete(taskId);

        if (global.io) global.io.to(projectId).emit("task_deleted", taskId);
        return res.status(200).json({ success: true, taskId, project: projectId });
    } catch (error) { console.error("DELETE TASK ERROR:", error); return res.status(500).json({ message: "Delete failed" }); }
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
        const userId = req.user._id;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        const project = await Project.findById(task.project)
            .populate("members.user")
            .populate("workspace"); // make sure workspace is populated

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        const isMember = project.members.some(
            (member) => member.user._id.toString() === userId.toString()
        );

        const isOwner =
            project.workspace?.owner?.toString() === userId.toString();

        if (!isMember && !isOwner) {
            return res.status(403).json({
                message: "You are not allowed to comment on this project",
            });
        }
        const newComment = await Comment.create({
            text,
            task: taskId,
            author: userId,
            readBy: [userId], // Author has read their own comment
        });

        task.comments.push(newComment._id);
        await task.save();

        // 1. Record Activity
        await recordActivity(userId, "added_comment", "Task", taskId, {
            description: `added comment: ${text.substring(0, 50) + (text.length > 50 ? "..." : "")}`,
        });

        // 2. Handle @Mentions Logic
        const mentions = text.match(/@\w+/g); // Find words starting with @

        if (mentions) {
            // Remove '@' and get unique names
            const mentionedNames = [...new Set(mentions.map(m => m.slice(1).toLowerCase()))];

            // Filter project members who match the mentioned names
            // Note: We populated 'members.user' above so we can access names
            const mentionedUsers = project.members.filter(m => {
                const memberName = (m.user.name || "").replace(/\s/g, "").toLowerCase();
                return mentionedNames.includes(memberName);
            });

            for (const member of mentionedUsers) {
                const recipientId = member.user._id.toString();

                // Don't notify self
                if (recipientId === userId.toString()) continue;

                // Create DB Notification
                await Notification.create({
                    user: recipientId,
                    title: "You were mentioned",
                    message: `${req.user.name} mentioned you in task: ${task.title}`,
                    targetType: "task",
                    targetId: task._id,
                    workspaceId: task.workspace,
                    projectId: task.project
                });

                // Socket Emit
                if (global.io) {
                    global.io.to(recipientId).emit("notification", {
                        title: "You were mentioned",
                        message: `${req.user.name} mentioned you in task: ${task.title}`,
                    });
                }
            }
        }

        // 3. Emit Real-time Comment Update
        if (global.io) {
            global.io.to(project._id.toString()).emit("comments_updated", { taskId });
        }

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

        // ✅ NEW: Fetch the workspace to check who the owner is
        // (Make sure the field name matches your Project schema, e.g., 'workspaceId' or 'workspace')
        const workspace = await Workspace.findById(project.workspaceId || project.workspace);

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found",
            });
        }

        // ✅ NEW: Check if the user is the Workspace Owner
        const isWorkspaceOwner = workspace.owner.toString() === req.user._id.toString();

        // Check if the user is a Project Member
        const isMember = project.members.some(
            (member) => member.user.toString() === req.user._id.toString()
        );

        // ✅ FIX: Allow access if they are EITHER a member OR the owner
        if (!isMember && !isWorkspaceOwner) {
            return res.status(403).json({
                message: "You don't have permission to watch this task",
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

        // ✅ NEW: Fetch the workspace to check who the owner is
        const workspace = await Workspace.findById(project.workspace || project.workspaceId);

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found",
            });
        }

        // ✅ NEW: Check if the user is the Workspace Owner
        const isWorkspaceOwner = workspace.owner.toString() === req.user._id.toString();

        const isMember = project.members.some(
            (member) => member.user.toString() === req.user._id.toString()
        );

        // ✅ FIX: Allow access if they are EITHER a member OR the workspace owner
        if (!isMember && !isWorkspaceOwner) {
            return res.status(403).json({
                message: "You do not have permission to archive this task",
            });
        }

        const isAchieved = task.isArchived;

        task.isArchived = !isAchieved;
        await task.save();

        // record activity
        await recordActivity(req.user._id, "updated_task", "Task", taskId, {
            description: `${isAchieved ? "unarchived" : "archived"} task ${task.title}`,
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
        const userId = req.user._id;
        const { workspaceId } = req.query; // ✅ Extract workspaceId from URL query

        if (!workspaceId) {
            return res.status(400).json({ message: "Workspace ID is required" });
        }

        // 1. Verify user belongs to THIS workspace and check their role
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        const isOwner = workspace.owner.toString() === userId.toString();
        const member = workspace.members.find(m => m.user.toString() === userId.toString());
        const isAdmin = member && member.role === "admin";

        if (!isOwner && !member) {
            return res.status(403).json({ message: "Not authorized for this workspace" });
        }

        // 2. Find projects ONLY for this specific workspace
        const projects = await Project.find({
            workspace: workspaceId,
            isArchived: false
        }).select("_id");

        const projectIds = projects.map(p => p._id);

        // 3. Query Tasks based on role
        let taskQuery = {
            project: { $in: projectIds },
            isArchived: false
        };

        // If the user is just a regular member, restrict them to ONLY tasks they are assigned to
        if (!isOwner && !isAdmin) {
            taskQuery.assignees = userId;
        }
        // (Owners and Admins bypass this if-statement, so they get ALL tasks in the workspace)

        const tasks = await Task.find(taskQuery)
            .populate("project", "title workspace")
            .populate("assignees", "name profilePicture")
            .sort({ dueDate: 1 });

        res.status(200).json(tasks);
    } catch (error) {
        console.error("GET MY TASKS ERROR:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
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

        // ✅ FIX: Use your robust checkTaskAccess helper instead of just checking project members
        const { isAuthorized } = await checkTaskAccess(req, task.project);
        if (!isAuthorized) {
            return res.status(403).json({ message: "Not allowed to add attachments" });
        }

        let attachment;

        if (type === "file") {
            if (!req.file) {
                return res.status(400).json({ message: "File is required" });
            }

            // req.file.path = the Cloudinary URL returned after upload
            // For PDFs we must append fl_inline so the browser displays
            // them instead of downloading. Cloudinary URL format:
            // https://res.cloudinary.com/cloud/image/upload/v123/folder/file.pdf
            //                                                 ↑ insert fl_inline here
            let fileUrl = req.file.path;

            if (req.file.mimetype === "application/pdf") {
                // Insert fl_inline transformation into the Cloudinary URL
                fileUrl = fileUrl.replace("/upload/", "/upload/fl_inline/");
            }

            attachment = {
                type: "file",
                fileName: req.file.originalname,
                fileUrl,
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
        // Multer-specific errors (file size, wrong type)
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(413).json({
                message: "File too large. Maximum size is 10 MB.",
            });
        }
        if (error.message?.includes("not supported") || error.message?.includes("not allowed")) {
            return res.status(415).json({ message: error.message });
        }
        console.error("ADD ATTACHMENT ERROR:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const deleteTaskAttachment = async (req, res) => {
    try {
        const { taskId, attachmentId } = req.params;
        const userId = req.user._id.toString();

        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: "Task not found" });

        const project = await Project.findById(task.project);
        const workspace = await Workspace.findById(project.workspace);

        // 1. Identify Attachment & Uploader
        const attachment = task.attachments.find(
            (att) => att._id.toString() === attachmentId
        );

        if (!attachment) return res.status(404).json({ message: "Attachment not found" });

        const uploaderId = attachment.uploadedBy.toString();

        // 2. Identify Roles
        const workspaceOwnerId = workspace.owner.toString();

        // Requester Role
        let requesterRole = "member";
        if (userId === workspaceOwnerId) requesterRole = "owner";
        else {
            const member = workspace.members.find(m => m.user.toString() === userId);
            if (member && member.role === "admin") requesterRole = "admin";
        }

        // Uploader Role
        let uploaderRole = "member";
        if (uploaderId === workspaceOwnerId) uploaderRole = "owner";
        else {
            const member = workspace.members.find(m => m.user.toString() === uploaderId);
            if (member && member.role === "admin") uploaderRole = "admin";
        }

        // 3. Permission Logic Matrix
        let isAllowed = false;

        if (requesterRole === "owner") {
            // ✅ Owner can delete ANYTHING
            isAllowed = true;
        } else if (requesterRole === "admin") {
            // ✅ Admin can delete Member's or Admin's files
            // ❌ Admin CANNOT delete Owner's files
            if (uploaderRole !== "owner") isAllowed = true;
        } else {
            // ✅ Member can ONLY delete their own files
            if (userId === uploaderId) isAllowed = true;
        }

        if (!isAllowed) {
            return res.status(403).json({ message: "You do not have permission to delete this attachment" });
        }

        // 4. Perform Delete
        task.attachments = task.attachments.filter(
            (att) => att._id.toString() !== attachmentId
        );

        await task.save();
        await recordActivity(req.user._id, "removed_attachment", "Task", taskId, {
            description: "removed an attachment",
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("DELETE ATTACHMENT ERROR:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const markCommentsAsRead = async (req, res) => {
    try {
        const { taskId } = req.params;
        const userId = req.user._id;

        // 1. Add current user to 'readBy' for all comments in this task
        // (Only if they aren't already in the list)
        await Comment.updateMany(
            { task: taskId, readBy: { $ne: userId } },
            { $addToSet: { readBy: userId } }
        );

        // 2. Trigger Socket Event so others see the Blue Ticks instantly
        const task = await Task.findById(taskId);
        if (global.io && task) {
            global.io.to(task.project.toString()).emit("comments_updated", { taskId });
        }

        res.status(200).json({ message: "Comments marked as read" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// HELPER: verify the user can access this task
const getTaskContext = async (taskId, userId) => {
    const task = await Task.findById(taskId);
    if (!task) return null;

    const project = await Project.findById(task.project);
    if (!project) return null;

    const workspace = await Workspace.findById(project.workspace);
    if (!workspace) return null;

    const isMember =
        workspace.owner.toString() === userId ||
        workspace.members.some((m) => (m.user._id || m.user).toString() === userId);

    if (!isMember) return null;

    return { task, project, workspace };
};

// Start a new timer session. Stops any currently running session first.
export const startTimer = async (req, res) => {
    try {
        const { taskId } = req.params;
        const userId = req.user._id.toString();

        const ctx = await getTaskContext(taskId, userId);
        if (!ctx) return res.status(404).json({ message: "Task not found or access denied" });

        // Stop any existing running session for this user on ANY task
        const runningSession = await TimeLog.findOne({
            user: userId,
            endTime: null,
        });

        if (runningSession) {
            const now = new Date();
            runningSession.endTime = now;
            runningSession.duration = Math.floor(
                (now - runningSession.startTime) / 1000
            );
            await runningSession.save();

            // Update actualHours on that task too
            await recalcActualHours(runningSession.task.toString());
        }

        // Create new session
        const newLog = await TimeLog.create({
            task: taskId,
            project: ctx.project._id,
            workspace: ctx.workspace._id,
            user: userId,
            startTime: new Date(),
            endTime: null,
            duration: 0,
        });

        res.status(201).json(newLog);
    } catch (error) {
        console.error("startTimer error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Stop the currently running timer for this user on this task
export const stopTimer = async (req, res) => {
    try {
        const { taskId } = req.params;
        const userId = req.user._id.toString();

        const session = await TimeLog.findOne({
            task: taskId,
            user: userId,
            endTime: null,
        });

        if (!session) {
            return res.status(404).json({ message: "No active timer found for this task" });
        }

        const now = new Date();
        session.endTime = now;
        session.duration = Math.floor((now - session.startTime) / 1000);
        if (req.body.note) session.note = req.body.note;
        await session.save();

        // Recalculate task's actualHours
        await recalcActualHours(taskId);

        res.status(200).json(session);
    } catch (error) {
        console.error("stopTimer error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get time logs based on Role (Member = Own, Admin/Owner = All)
export const getTimeLogs = async (req, res) => {
    try {
        const { taskId } = req.params;
        const userId = req.user._id.toString();

        const ctx = await getTaskContext(taskId, userId);
        if (!ctx) return res.status(404).json({ message: "Task not found or access denied" });

        // 1. Identify User's Role in this Workspace
        const isOwner = ctx.workspace.owner.toString() === userId;
        const memberData = ctx.workspace.members.find(m => (m.user._id || m.user).toString() === userId);
        const isAdmin = memberData?.role === "admin";

        // 2. Build Query (Admins/Owners see all, Members see only their own)
        const query = { task: taskId };
        if (!isOwner && !isAdmin) {
            query.user = userId; // Secure: Restrict to only this user's logs
        }

        // 3. Fetch Logs
        const logs = await TimeLog.find(query)
            .populate("user", "name profilePicture")
            .sort({ startTime: -1 });

        // 4. Fetch Active Session (only for the current user)
        const activeSession = await TimeLog.findOne({
            task: taskId,
            user: userId,
            endTime: null,
        }).populate("user", "name profilePicture");

        // 5. Calculate Total Time (will automatically be 'Total Team Time' for admins, and 'Personal Time' for members)
        const totalSeconds = logs
            .filter((l) => l.endTime !== null)
            .reduce((sum, l) => sum + (l.duration || 0), 0);

        res.status(200).json({
            logs,
            activeSession,
            totalSeconds,
        });
    } catch (error) {
        console.error("getTimeLogs error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Delete a specific time log entry

export const deleteTimeLog = async (req, res) => {
    try {
        const { taskId, logId } = req.params;
        const userId = req.user._id.toString();

        const log = await TimeLog.findById(logId);
        if (!log) return res.status(404).json({ message: "Log not found" });

        // Only the owner of the log or workspace admin can delete
        const ctx = await getTaskContext(taskId, userId);
        if (!ctx) return res.status(403).json({ message: "Access denied" });

        const isOwner = log.user.toString() === userId;
        const isAdmin =
            ctx.workspace.owner.toString() === userId ||
            ctx.workspace.members.some(
                (m) =>
                    (m.user._id || m.user).toString() === userId &&
                    ["admin", "owner"].includes(m.role)
            );

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: "Not allowed to delete this log" });
        }

        await TimeLog.findByIdAndDelete(logId);
        await recalcActualHours(taskId);

        res.status(200).json({ message: "Time log deleted" });
    } catch (error) {
        console.error("deleteTimeLog error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// INTERNAL: Recalculate task's actualHours from all completed logs
const recalcActualHours = async (taskId) => {
    const logs = await TimeLog.find({ task: taskId, endTime: { $ne: null } });
    const totalSeconds = logs.reduce((sum, l) => sum + (l.duration || 0), 0);
    const totalHours = parseFloat((totalSeconds / 3600).toFixed(2));
    await Task.findByIdAndUpdate(taskId, { actualHours: totalHours });
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
    deleteTaskAttachment,
    markCommentsAsRead,
};