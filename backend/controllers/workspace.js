import Workspace from "../models/workspace.js";
import Project from "../models/project.js";
import User from "../models/user.js";
import WorkspaceInvite from "../models/workspace-invite.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../libs/send-email.js";
import { recordActivity } from "../libs/index.js";
import Task from "../models/task.js";


const createWorkspace = async (req, res) => {
    try {
        const { name, description, color } = req.body;

        const workspace = await Workspace.create({
            name,
            description,
            color,
            owner: req.user._id,
            members: [
                {
                    user: req.user._id,
                    role: "owner",
                    joinedAt: new Date(),
                },
            ],
        });

        res.status(201).json(workspace);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};

const getWorkspaces = async (req, res) => {
    try {
        const workspaces = await Workspace.find({
            "members.user": req.user._id,
        }).sort({ createdAt: -1 });

        res.status(200).json(workspaces);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};

const getWorkspaceDetails = async (req, res) => {
    try {
        const { workspaceId } = req.params;

        const workspace = await Workspace.findById({
            _id: workspaceId,
        }).populate("members.user", "name email profilePicture");

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found",
            });
        }

        res.status(200).json(workspace);
    } catch (error) { }
};
const updateWorkspace = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { name, description, color } = req.body;

        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found",
            });
        }

        // 🔐 Permission check (owner or admin)
        const member = workspace.members.find(
            (m) => m.user.toString() === req.user._id.toString()
        );

        if (!member || !["owner", "admin"].includes(member.role)) {
            return res.status(403).json({
                message: "You are not allowed to update this workspace",
            });
        }

        // Update only provided fields
        if (name !== undefined) workspace.name = name;
        if (description !== undefined) workspace.description = description;
        if (color !== undefined) workspace.color = color;

        await workspace.save();

        res.status(200).json(workspace);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};

const getWorkspaceProjects = async (req, res) => {
    try {
        const { workspaceId } = req.params;

        const workspace = await Workspace.findOne({
            _id: workspaceId,
            "members.user": req.user._id,
        }).populate("members.user", "name email profilePicture");

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found",
            });
        }

        const projects = await Project.find({
            workspace: workspaceId,
            isArchived: false,
            members: { $elemMatch: { user: req.user._id } },
        })
            .populate("tasks", "status")
            .sort({ createdAt: -1 });

        res.status(200).json({ projects, workspace });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};
const getWorkspaceStats = async (req, res) => {
    try {
        const { workspaceId } = req.params;

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

        const [totalProjects, projects] = await Promise.all([
            Project.countDocuments({ workspace: workspaceId }),
            Project.find({ workspace: workspaceId })
                .populate(
                    "tasks",
                    "title status dueDate project updatedAt isArchived priority"
                )
                .sort({ createdAt: -1 }),
        ]);

        const totalTasks = projects.reduce((acc, project) => {
            return acc + project.tasks.length;
        }, 0);

        const totalProjectInProgress = projects.filter((project) => project.status === "In Progress").length;
        // const totalProjectCompleted = projects.filter(
        //   (project) => project.status === "Completed"
        // ).length;

        const totalTaskCompleted = projects.reduce((acc, project) => {
            return (
                acc + project.tasks.filter((task) => task.status === "Done").length
            );
        }, 0);

        const totalTaskToDo = projects.reduce((acc, project) => {
            return (
                acc + project.tasks.filter((task) => task.status === "To Do").length
            );
        }, 0);

        const totalTaskInProgress = projects.reduce((acc, project) => {
            return (
                acc +
                project.tasks.filter((task) => task.status === "In Progress").length
            );
        }, 0);

        const tasks = projects.flatMap((project) => project.tasks);

        // get upcoming task in next 7 days

        const now = new Date();
        const next7Days = new Date();
        next7Days.setDate(now.getDate() + 7);

        const upcomingTasks = tasks.filter((task) => {
            if (!task.dueDate) return false;               // must have due date
            if (task.isArchived) return false;             // ignore archived
            if (task.status === "Done") return false;      // ignore completed

            const due = new Date(task.dueDate);

            return due >= now && due <= next7Days;
        });



        const taskTrendsData = [
            { name: "Sun", completed: 0, inProgress: 0, todo: 0 },
            { name: "Mon", completed: 0, inProgress: 0, todo: 0 },
            { name: "Tue", completed: 0, inProgress: 0, todo: 0 },
            { name: "Wed", completed: 0, inProgress: 0, todo: 0 },
            { name: "Thu", completed: 0, inProgress: 0, todo: 0 },
            { name: "Fri", completed: 0, inProgress: 0, todo: 0 },
            { name: "Sat", completed: 0, inProgress: 0, todo: 0 },
        ];

        // get last 7 days tasks date
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return date;
        }).reverse();

        // populate

        for (const project of projects) {
            for (const task of project.tasks) {
                const taskDate = new Date(task.updatedAt);

                const dayInDate = last7Days.findIndex(
                    (date) =>
                        date.getDate() === taskDate.getDate() &&
                        date.getMonth() === taskDate.getMonth() &&
                        date.getFullYear() === taskDate.getFullYear()
                );

                if (dayInDate !== -1) {
                    const dayName = last7Days[dayInDate].toLocaleDateString("en-US", {
                        weekday: "short",
                    });

                    const dayData = taskTrendsData.find((day) => day.name === dayName);

                    if (dayData) {
                        switch (task.status) {
                            case "Done":
                                dayData.completed++;
                                break;
                            case "In Progress":
                                dayData.inProgress++;
                                break;
                            case "To Do":
                                dayData.todo++;
                                break;
                        }
                    }
                }
            }
        }

        // get project status distribution
        const projectStatusData = [
            { name: "Completed", value: 0, color: "#10b981" },
            { name: "In Progress", value: 0, color: "#3b82f6" },
            { name: "Planning", value: 0, color: "#f59e0b" },
        ];

        for (const project of projects) {
            switch (project.status) {
                case "Completed":
                    projectStatusData[0].value++;
                    break;
                case "In Progress":
                    projectStatusData[1].value++;
                    break;
                case "Planning":
                    projectStatusData[2].value++;
                    break;
            }
        }

        // Task priority distribution
        const taskPriorityData = [
            { name: "High", value: 0, color: "#ef4444" },
            { name: "Medium", value: 0, color: "#f59e0b" },
            { name: "Low", value: 0, color: "#6b7280" },
        ];

        for (const task of tasks) {
            switch (task.priority) {
                case "High":
                    taskPriorityData[0].value++;
                    break;
                case "Medium":
                    taskPriorityData[1].value++;
                    break;
                case "Low":
                    taskPriorityData[2].value++;
                    break;
            }
        }

        const workspaceProductivityData = [];

        for (const project of projects) {
            const projectTask = tasks.filter(
                (task) => task.project.toString() === project._id.toString()
            );

            const completedTask = projectTask.filter(
                (task) => task.status === "Done" && task.isArchived === false
            );

            workspaceProductivityData.push({
                name: project.title,
                completed: completedTask.length,
                total: projectTask.length,
            });
        }
        const stats = {
            totalProjects,
            totalTasks,
            totalProjectInProgress,
            totalTaskCompleted,
            totalTaskToDo,
            totalTaskInProgress,
        };

        res.status(200).json({
            stats,
            taskTrendsData,
            projectStatusData,
            taskPriorityData,
            workspaceProductivityData,
            upcomingTasks,
            recentProjects: projects.slice(0, 3),
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};
const getArchivedData = async (req, res) => {
    try {
        const { workspaceId } = req.params;

        const archivedProjects = await Project.find({
            workspace: workspaceId,
            isArchived: true,
        });

        const archivedTasks = await Task.find({
            isArchived: true,
        }).populate("project");

        res.status(200).json({
            archivedProjects,
            archivedTasks,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const inviteUserToWorkspace = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { email, role } = req.body;

        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found",
            });
        }

        const userMemberInfo = workspace.members.find(
            (member) => member.user.toString() === req.user._id.toString()
        );

        if (!userMemberInfo || !["admin", "owner"].includes(userMemberInfo.role)) {
            return res.status(403).json({
                message: "You are not authorized to invite members to this workspace",
            });
        }

        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(400).json({
                message: "User not found",
            });
        }

        const isMember = workspace.members.some(
            (member) => member.user.toString() === existingUser._id.toString()
        );

        if (isMember) {
            return res.status(400).json({
                message: "User already a member of this workspace",
            });
        }

        const isInvited = await WorkspaceInvite.findOne({
            user: existingUser._id,
            workspaceId: workspaceId,
        });

        if (isInvited && isInvited.expiresAt > new Date()) {
            return res.status(400).json({
                message: "User already invited to this workspace",
            });
        }

        if (isInvited && isInvited.expiresAt < new Date()) {
            await WorkspaceInvite.deleteOne({ _id: isInvited._id });
        }

        const inviteToken = jwt.sign(
            {
                user: existingUser._id,
                workspaceId: workspaceId,
                role: role || "member",
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        await WorkspaceInvite.create({
            user: existingUser._id,
            workspaceId: workspaceId,
            token: inviteToken,
            role: role || "member",
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        const invitationLink = `${process.env.FRONTEND_URL}/workspace-invite/${workspace._id}?tk=${inviteToken}`;

        const emailContent = `
      <p>You have been invited to join ${workspace.name} workspace</p>
      <p>Click here to join: <a href="${invitationLink}">${invitationLink}</a></p>
    `;

        await sendEmail(
            email,
            "You have been invited to join a workspace",
            emailContent
        );

        res.status(200).json({
            message: "Invitation sent successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};

const acceptGenerateInvite = async (req, res) => {
    try {
        const { workspaceId } = req.params;

        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found",
            });
        }

        const isMember = workspace.members.some(
            (member) => member.user.toString() === req.user._id.toString()
        );

        if (isMember) {
            return res.status(400).json({
                message: "You are already a member of this workspace",
            });
        }

        workspace.members.push({
            user: req.user._id,
            role: "member",
            joinedAt: new Date(),
        });

        await workspace.save();

        await recordActivity(
            req.user._id,
            "joined_workspace",
            "Workspace",
            workspaceId,
            {
                description: `Joined ${workspace.name} workspace`,
            }
        );

        res.status(200).json({
            message: "Invitation accepted successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};

const acceptInviteByToken = async (req, res) => {
    try {
        const { token } = req.body;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const { user, workspaceId, role } = decoded;

        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found",
            });
        }

        const isMember = workspace.members.some(
            (member) => member.user.toString() === user.toString()
        );

        if (isMember) {
            return res.status(400).json({
                message: "User already a member of this workspace",
            });
        }

        const inviteInfo = await WorkspaceInvite.findOne({
            user: user,
            workspaceId: workspaceId,
        });

        if (!inviteInfo) {
            return res.status(404).json({
                message: "Invitation not found",
            });
        }

        if (inviteInfo.expiresAt < new Date()) {
            return res.status(400).json({
                message: "Invitation has expired",
            });
        }

        workspace.members.push({
            user: user,
            role: role || "member",
            joinedAt: new Date(),
        });

        await workspace.save();

        await Promise.all([
            WorkspaceInvite.deleteOne({ _id: inviteInfo._id }),
            recordActivity(user, "joined_workspace", "Workspace", workspaceId, {
                description: `Joined ${workspace.name} workspace`,
            }),
        ]);

        res.status(200).json({
            message: "Invitation accepted successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};
const transferWorkspaceOwnership = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { newOwnerId } = req.body;

        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        // Only current owner can transfer
        if (workspace.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Only owner can transfer workspace ownership",
            });
        }

        const newOwnerMember = workspace.members.find(
            (m) => m.user.toString() === newOwnerId
        );

        if (!newOwnerMember) {
            return res.status(400).json({
                message: "New owner must be a workspace member",
            });
        }

        // Update member roles
        workspace.members = workspace.members.map((m) => {
            if (m.user.toString() === newOwnerId) {
                return { ...m.toObject(), role: "owner" };
            }
            if (m.role === "owner") {
                return { ...m.toObject(), role: "admin" };
            }
            return m;
        });

        workspace.owner = newOwnerId;

        await workspace.save();

        res.status(200).json(workspace);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
const deleteWorkspace = async (req, res) => {
    try {
        const { workspaceId } = req.params;

        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({
                message: "Workspace not found",
            });
        }

        if (workspace.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Only owner can delete this workspace",
            });
        }

        // Optional cleanup (recommended)
        await Promise.all([
            Project.deleteMany({ workspace: workspaceId }),
            Task.deleteMany({ workspace: workspaceId }),
            WorkspaceInvite.deleteMany({ workspaceId }),
        ]);

        await Workspace.findByIdAndDelete(workspaceId);

        res.status(200).json({
            message: "Workspace deleted successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};


export {
    createWorkspace,
    getWorkspaces, getWorkspaceDetails, getWorkspaceProjects, getWorkspaceStats,
    getArchivedData, inviteUserToWorkspace, acceptGenerateInvite, acceptInviteByToken,
    updateWorkspace, transferWorkspaceOwnership, deleteWorkspace
};