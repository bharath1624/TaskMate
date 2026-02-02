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
            name, description, color, owner: req.user._id,
            members: [{ user: req.user._id, role: "owner", joinedAt: new Date() }],
        });
        res.status(201).json(workspace);
    } catch (error) { console.log(error); res.status(500).json({ message: "Internal server error" }); }
};

const getWorkspaces = async (req, res) => {
    try {
        const workspaces = await Workspace.find({ "members.user": req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(workspaces);
    } catch (error) { console.log(error); res.status(500).json({ message: "Internal server error" }); }
};

const getWorkspaceDetails = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const workspace = await Workspace.findById({ _id: workspaceId }).populate("members.user", "name email profilePicture");
        if (!workspace) return res.status(404).json({ message: "Workspace not found" });
        res.status(200).json(workspace);
    } catch (error) { }
};

const updateWorkspace = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { name, description, color } = req.body;
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) return res.status(404).json({ message: "Workspace not found" });
        const member = workspace.members.find(m => m.user.toString() === req.user._id.toString());
        if (!member || !["owner", "admin"].includes(member.role)) return res.status(403).json({ message: "Not allowed" });
        if (name !== undefined) workspace.name = name;
        if (description !== undefined) workspace.description = description;
        if (color !== undefined) workspace.color = color;
        await workspace.save();
        res.status(200).json(workspace);
    } catch (error) { console.log(error); res.status(500).json({ message: "Internal server error" }); }
};

// ✅ FIX 1: GET WORKSPACE PROJECTS (DASHBOARD)
const getWorkspaceProjects = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const userId = req.user._id.toString();

        // Fetch workspace first to check owner
        const workspace = await Workspace.findOne({
            _id: workspaceId,
            "members.user": req.user._id,
        }).populate("members.user", "name email profilePicture");

        if (!workspace) return res.status(404).json({ message: "Workspace not found" });

        // 👑 GOD MODE CHECK
        const isWorkspaceOwner = workspace.owner.toString() === userId;

        // Build Query
        let query = {
            workspace: workspaceId,
            isArchived: false,
        };

        // 🔒 IF NOT OWNER, APPLY FILTER
        if (!isWorkspaceOwner) {
            query.members = { $elemMatch: { user: req.user._id } };
        }

        const projects = await Project.find(query)
            .populate({
                path: "tasks",
                match: { isArchived: false }, // 👈 THIS IS THE FIX. Only fetch active tasks.
                select: "status"
            })
            .sort({ createdAt: -1 });

        res.status(200).json({ projects, workspace });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ✅ FIX 2: GET WORKSPACE STATS
const getWorkspaceStats = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const userId = req.user._id.toString();

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) return res.status(404).json({ message: "Workspace not found" });

        const isMember = workspace.members.some(member => member.user.toString() === userId);
        if (!isMember) return res.status(403).json({ message: "You are not a member of this workspace" });

        // 👑 GOD MODE CHECK
        const isWorkspaceOwner = workspace.owner.toString() === userId;

        let projectQuery = { workspace: workspaceId, isArchived: false };
        if (!isWorkspaceOwner) {
            projectQuery["members.user"] = userId;
        }

        const [totalProjects, projects] = await Promise.all([
            Project.countDocuments(projectQuery),
            Project.find(projectQuery)
                .populate({
                    path: "tasks",
                    match: { isArchived: false }, // ✅ ONLY fetch active tasks
                    select: "title status dueDate project updatedAt isArchived priority"
                })
                .sort({ createdAt: -1 }),
        ]);

        const totalTasks = projects.reduce((acc, project) => acc + project.tasks.length, 0);
        const totalProjectInProgress = projects.filter((project) => project.status === "In Progress").length;
        const totalTaskCompleted = projects.reduce((acc, project) => acc + project.tasks.filter((task) => task.status === "Done").length, 0);
        const totalTaskToDo = projects.reduce((acc, project) => acc + project.tasks.filter((task) => task.status === "To Do").length, 0);
        const totalTaskInProgress = projects.reduce((acc, project) => acc + project.tasks.filter((task) => task.status === "In Progress").length, 0);

        const tasks = projects.flatMap((project) => project.tasks);
        const now = new Date();
        const next7Days = new Date();
        next7Days.setDate(now.getDate() + 7);

        const upcomingTasks = tasks.filter((task) => {
            if (!task.dueDate || task.isArchived || task.status === "Done") return false;
            const due = new Date(task.dueDate);
            return due >= now && due <= next7Days;
        });

        // Trends & Stats Data (Standard)
        const taskTrendsData = [
            { name: "Sun", completed: 0, inProgress: 0, todo: 0 },
            { name: "Mon", completed: 0, inProgress: 0, todo: 0 },
            { name: "Tue", completed: 0, inProgress: 0, todo: 0 },
            { name: "Wed", completed: 0, inProgress: 0, todo: 0 },
            { name: "Thu", completed: 0, inProgress: 0, todo: 0 },
            { name: "Fri", completed: 0, inProgress: 0, todo: 0 },
            { name: "Sat", completed: 0, inProgress: 0, todo: 0 },
        ];
        const last7Days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return d; }).reverse();
        for (const project of projects) {
            for (const task of project.tasks) {
                const taskDate = new Date(task.updatedAt);
                const dayInDate = last7Days.findIndex(d => d.getDate() === taskDate.getDate() && d.getMonth() === taskDate.getMonth());
                if (dayInDate !== -1) {
                    const dayName = last7Days[dayInDate].toLocaleDateString("en-US", { weekday: "short" });
                    const dayData = taskTrendsData.find(d => d.name === dayName);
                    if (dayData) {
                        if (task.status === "Done") dayData.completed++;
                        else if (task.status === "In Progress") dayData.inProgress++;
                        else if (task.status === "To Do") dayData.todo++;
                    }
                }
            }
        }
        const projectStatusData = [{ name: "Completed", value: 0, color: "#10b981" }, { name: "In Progress", value: 0, color: "#3b82f6" }, { name: "Planning", value: 0, color: "#f59e0b" }];
        for (const p of projects) {
            if (p.status === "Completed") projectStatusData[0].value++;
            else if (p.status === "In Progress") projectStatusData[1].value++;
            else if (p.status === "Planning") projectStatusData[2].value++;
        }
        const taskPriorityData = [{ name: "High", value: 0, color: "#ef4444" }, { name: "Medium", value: 0, color: "#f59e0b" }, { name: "Low", value: 0, color: "#6b7280" }];
        for (const t of tasks) {
            if (t.priority === "High") taskPriorityData[0].value++;
            else if (t.priority === "Medium") taskPriorityData[1].value++;
            else if (t.priority === "Low") taskPriorityData[2].value++;
        }
        const workspaceProductivityData = projects.map(p => {
            const pTasks = tasks.filter(t => t.project.toString() === p._id.toString());
            return { name: p.title, completed: pTasks.filter(t => t.status === "Done" && !t.isArchived).length, total: pTasks.length };
        });

        const stats = { totalProjects, totalTasks, totalProjectInProgress, totalTaskCompleted, totalTaskToDo, totalTaskInProgress };
        res.status(200).json({ stats, taskTrendsData, projectStatusData, taskPriorityData, workspaceProductivityData, upcomingTasks, recentProjects: projects.slice(0, 3) });
    } catch (error) { console.log(error); res.status(500).json({ message: "Internal server error" }); }
};

// ✅ FIX 3: GET ARCHIVED DATA
const getArchivedData = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const userId = req.user._id.toString();

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) return res.status(404).json({ message: "Workspace not found" });

        const isWorkspaceOwner = workspace.owner.toString() === userId;

        let query = { workspace: workspaceId, isArchived: true };
        if (!isWorkspaceOwner) {
            query["members.user"] = userId;
        }

        const archivedProjects = await Project.find(query).sort({ updatedAt: -1 });

        let projectQuery = { workspace: workspaceId };
        if (!isWorkspaceOwner) projectQuery["members.user"] = userId;
        const allVisibleProjects = await Project.find(projectQuery).select("_id");

        const archivedTasks = await Task.find({
            project: { $in: allVisibleProjects.map(p => p._id) },
            isArchived: true,
        }).populate("project", "title").sort({ updatedAt: -1 });

        res.status(200).json({ archivedProjects, archivedTasks });
    } catch (error) { console.error(error); res.status(500).json({ message: "Server error" }); }
};

const inviteUserToWorkspace = async (req, res) => { /* Same as your old code */
    try {
        const { workspaceId } = req.params; const { email, role } = req.body;
        const normalizedEmail = email.toLowerCase().trim();
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) return res.status(404).json({ message: "Workspace not found" });
        const userMemberInfo = workspace.members.find((member) => member.user.toString() === req.user._id.toString());
        if (!userMemberInfo || !["admin", "owner"].includes(userMemberInfo.role)) return res.status(403).json({ message: "Unauthorized" });
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser && workspace.members.some((m) => m.user.toString() === existingUser._id.toString())) return res.status(400).json({ message: "User already in workspace" });

        const existingInvite = await WorkspaceInvite.findOne({ email: normalizedEmail, workspaceId, expiresAt: { $gt: new Date() }, status: "pending" });
        if (existingInvite) {
            const invitationLink = `${process.env.FRONTEND_URL}/workspace-invite?token=${existingInvite.token}`;
            await sendEmail(normalizedEmail, "Invitation (Resent)", `<a href="${invitationLink}">${invitationLink}</a>`);
            return res.status(200).json({ message: "Resent" });
        }
        const inviteToken = jwt.sign({ email: normalizedEmail, workspaceId, role: role || "member" }, process.env.JWT_SECRET, { expiresIn: "7d" });
        await WorkspaceInvite.create({ user: existingUser?._id, email: normalizedEmail, workspaceId, token: inviteToken, role: role || "member", status: "pending", expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
        const invitationLink = `${process.env.FRONTEND_URL}/workspace-invite?token=${inviteToken}`;
        await sendEmail(normalizedEmail, "Invitation", `<a href="${invitationLink}">${invitationLink}</a>`);
        return res.status(200).json({ message: "Sent" });
    } catch (error) { console.error(error); res.status(500).json({ message: "Error" }); }
};

const acceptGenerateInvite = async (req, res) => { /* Same as your old code */
    try {
        const { workspaceId } = req.params;
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) return res.status(404).json({ message: "Not found" });
        if (workspace.members.some(m => m.user.toString() === req.user._id.toString())) return res.status(400).json({ message: "Already member" });
        workspace.members.push({ user: req.user._id, role: "member", joinedAt: new Date() });
        await workspace.save();
        await recordActivity(req.user._id, "joined_workspace", "Workspace", workspaceId, { description: `Joined ${workspace.name}` });
        res.status(200).json({ message: "Accepted" });
    } catch (e) { res.status(500).json({ message: "Error" }); }
};

const acceptInviteByToken = async (req, res) => { /* Same as your old code */
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ message: "Token missing" });
        const invite = await WorkspaceInvite.findOne({ token });
        if (!invite || invite.status !== "pending" || new Date() > new Date(invite.expiresAt)) return res.status(404).json({ message: "Invalid/Expired" });
        if (!req.user) return res.status(200).json({ requiresAuth: true, email: invite.email });
        const workspace = await Workspace.findById(invite.workspaceId);
        if (!workspace) return res.status(404).json({ message: "Workspace not found" });
        if (!workspace.members.some(m => m.user.toString() === req.user._id.toString())) {
            workspace.members.push({ user: req.user._id, role: invite.role, joinedAt: new Date() });
            await workspace.save();
        }
        invite.status = "accepted"; invite.user = req.user._id; await invite.save();
        return res.status(200).json({ joined: true, workspaceId: workspace._id });
    } catch (e) { res.status(500).json({ message: "Error" }); }
};

const transferWorkspaceOwnership = async (req, res) => { /* Same as your old code */
    try {
        const { workspaceId } = req.params; const { newOwnerId } = req.body;
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) return res.status(404).json({ message: "Not found" });
        if (workspace.owner.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Forbidden" });
        const newOwnerMember = workspace.members.find(m => m.user.toString() === newOwnerId);
        if (!newOwnerMember) return res.status(400).json({ message: "Must be member" });
        workspace.members = workspace.members.map(m => {
            if (m.user.toString() === newOwnerId) return { ...m.toObject(), role: "owner" };
            if (m.role === "owner") return { ...m.toObject(), role: "admin" };
            return m;
        });
        workspace.owner = newOwnerId; await workspace.save();
        res.status(200).json(workspace);
    } catch (e) { res.status(500).json({ message: "Error" }); }
};

const deleteWorkspace = async (req, res) => { /* Same as your old code */
    try {
        const { workspaceId } = req.params;
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) return res.status(404).json({ message: "Not found" });
        if (workspace.owner.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Forbidden" });
        await Promise.all([Project.deleteMany({ workspace: workspaceId }), Task.deleteMany({ workspace: workspaceId }), WorkspaceInvite.deleteMany({ workspaceId })]);
        await Workspace.findByIdAndDelete(workspaceId);
        res.status(200).json({ message: "Deleted" });
    } catch (e) { res.status(500).json({ message: "Error" }); }
};

const removeMemberFromWorkspace = async (req, res) => { /* Same as your old code */
    try {
        const { workspaceId, memberId } = req.params;
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) return res.status(404).json({ message: "Not found" });
        if (workspace.owner.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Forbidden" });
        if (memberId === req.user._id.toString()) return res.status(400).json({ message: "Cannot remove self" });
        await Workspace.findByIdAndUpdate(workspaceId, { $pull: { members: { user: memberId } } });
        res.status(200).json({ message: "Member removed" });
    } catch (e) { res.status(500).json({ message: "Error" }); }
};

export {
    createWorkspace,
    getWorkspaces, getWorkspaceDetails, getWorkspaceProjects, getWorkspaceStats,
    getArchivedData, inviteUserToWorkspace, acceptGenerateInvite, acceptInviteByToken,
    updateWorkspace, transferWorkspaceOwnership, deleteWorkspace, removeMemberFromWorkspace
};