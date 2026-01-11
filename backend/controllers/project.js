import Workspace from "../models/workspace.js";
import Project from "../models/project.js";
import Task from "../models/task.js";
import Notification from "../models/notification.js";
import { io } from "../index.js";

const createProject = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { title, description, status, startDate, dueDate, tags, members } =
            req.body;

        const workspace = await Workspace.findById(workspaceId);

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

        const tagArray = tags ? tags.split(",") : [];
        const newProject = await Project.create({
            title,
            description,
            status,
            startDate,
            dueDate,
            tags: tagArray,
            workspace: workspaceId,
            members,
            createdBy: req.user._id,
        });

        workspace.projects.push(newProject._id);
        await workspace.save();
        // extract userIds from members [{ user, role }]
        const memberUserIds = Array.isArray(members)
            ? members.map(m => m.user)
            : [];

        console.log("👥 Extracted memberUserIds:", memberUserIds);

        // 🔔 Project assignment notifications
        for (const userId of memberUserIds) {
            // optional: skip creator
            // if (userId.toString() === req.user._id.toString()) continue;

            await Notification.create({
                user: userId,
                title: "Project assigned",
                message: `You were added to "${newProject.title}" project`,
                targetType: "project",
                targetId: newProject._id,
                workspaceId: workspace._id,
            });

            io.to(userId.toString()).emit("notification", {
                title: "Project assigned",
                message: `You were added to "${newProject.title}" project`,
                targetType: "project",
                targetId: newProject._id,
                workspaceId: workspace._id,
            });
        }





        return res.status(201).json(newProject);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

const getProjectDetails = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId);

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
        res.status(200).json(project);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

const getProjectTasks = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await Project.findById(projectId).populate("members.user");

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        const isMember = project.members.some(
            (member) => member.user._id.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                message: "You are not a member of this project",
            });
        }

        const tasks = await Task.find({
            project: projectId,
            isArchived: false,
        })
            .populate("assignees", "name profilePicture")
            .sort({ createdAt: -1 });

        res.status(200).json({
            project,
            tasks,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

const archiveProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        project.isArchived = !project.isArchived; // toggle archive
        await project.save();

        res.status(200).json({
            message: project.isArchived
                ? "Project archived"
                : "Project unarchived",
            project,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const toggleArchiveProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        project.isArchived = !project.isArchived;
        await project.save();

        res.status(200).json({
            message: project.isArchived
                ? "Project archived successfully"
                : "Project unarchived successfully",
            project,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update project" });
    }
};
const updateProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { title, description, status, tags, startDate, dueDate } = req.body;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // 🔒 Permission check (member only)
        const isMember = project.members.some(
            (member) => member.user.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                message: "You are not allowed to update this project",
            });
        }

        if (title !== undefined) project.title = title;
        if (description !== undefined) project.description = description;
        if (status !== undefined) project.status = status;
        if (startDate !== undefined) project.startDate = startDate;
        if (dueDate !== undefined) project.dueDate = dueDate;

        if (tags !== undefined) {
            project.tags = Array.isArray(tags)
                ? tags
                : tags.split(",").map(tag => tag.trim());
        }

        await project.save();

        res.status(200).json({
            message: "Project updated successfully",
            project,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update project" });
    }
};
const deleteProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // 🔒 Permission check (only creator / owner)
        if (project.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You are not allowed to delete this project",
            });
        }

        // 🧹 Delete all tasks under this project
        await Task.deleteMany({ project: projectId });

        // 🧹 Remove project from workspace
        await Workspace.findByIdAndUpdate(project.workspace, {
            $pull: { projects: projectId },
        });

        // 🧹 Optional: remove notifications
        await Notification.deleteMany({
            targetType: "project",
            targetId: projectId,
        });

        // ❌ Delete project itself
        await Project.findByIdAndDelete(projectId);

        res.status(200).json({
            message: "Project deleted permanently",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to delete project" });
    }
};


export { createProject, getProjectDetails, getProjectTasks, archiveProject, toggleArchiveProject, updateProject, deleteProject };