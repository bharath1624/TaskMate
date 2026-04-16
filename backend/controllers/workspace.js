import mongoose from "mongoose";
import Workspace from "../models/workspace.js";
import Project from "../models/project.js";
import User from "../models/user.js";
import WorkspaceInvite from "../models/workspace-invite.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../libs/send-email.js";
import { recordActivity } from "../libs/index.js";
import Task from "../models/task.js";
import TimeLog from "../models/time-log.js";


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
        // 1. Use .populate() to check if the users still exist
        // 2. Use .lean() so we can easily modify the javascript object
        const workspaces = await Workspace.find({ "members.user": req.user._id })
            .populate("members.user", "_id")
            .sort({ createdAt: -1 })
            .lean();

        // 3. Filter out any members where the user account no longer exists
        const cleanWorkspaces = workspaces.map(ws => {
            return {
                ...ws,
                members: ws.members.filter(m => m.user !== null)
            };
        });

        res.status(200).json(cleanWorkspaces);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getWorkspaceDetails = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const workspace = await Workspace.findById(workspaceId)
            .populate("members.user", "name email profilePicture");

        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        // 🔥 REMOVE NULL USERS (DANGLING REFERENCES)
        workspace.members = workspace.members.filter(member => member.user !== null);

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
// ✅ UPDATED: GET WORKSPACE PROJECTS (DASHBOARD) with TIME ROLLUP
const getWorkspaceProjects = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const userId = req.user._id.toString();

        // 1. Fetch workspace first to check owner/role
        const workspace = await Workspace.findOne({
            _id: workspaceId,
            "members.user": req.user._id,
        }).populate("members.user", "name email profilePicture");

        if (!workspace) return res.status(404).json({ message: "Workspace not found" });
        workspace.members = workspace.members.filter(member => member.user !== null);

        // 2. Determine Role
        const isWorkspaceOwner = workspace.owner.toString() === userId;
        const memberData = workspace.members.find(m => m.user._id.toString() === userId);
        const isAdmin = memberData?.role === "admin";

        // 3. Build Project Query
        let query = {
            workspace: workspaceId,
            isArchived: false,
        };

        // If regular member, only show projects they are part of
        if (!isWorkspaceOwner && !isAdmin) {
            query.members = { $elemMatch: { user: req.user._id } };
        }

        // 4. Fetch Projects
        const projects = await Project.find(query)
            .populate({
                path: "tasks",
                match: { isArchived: false },
                select: "status"
            })
            .sort({ createdAt: -1 })
            .lean(); // Convert to raw JS objects so we can attach time data

        // 5. Build Aggregation Pipeline for Time Tracking
        // We only want completed time logs (endTime is not null)
        const matchStage = {
            workspace: new mongoose.Types.ObjectId(workspaceId),
            endTime: { $ne: null }
        };

        // If regular member, ONLY sum up THEIR time. If Admin/Owner, sum up ALL time.
        if (!isWorkspaceOwner && !isAdmin) {
            matchStage.user = new mongoose.Types.ObjectId(userId);
        }

        const timeAggregation = await TimeLog.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: "$project", // Group by Project ID
                    totalSeconds: { $sum: "$duration" }
                }
            }
        ]);

        // Create a fast lookup map: { projectId: totalSeconds }
        const timeMap = {};
        timeAggregation.forEach(stat => {
            timeMap[stat._id.toString()] = stat.totalSeconds;
        });

        // 6. Attach time data to each project
        const projectsWithTime = projects.map(project => ({
            ...project,
            totalTimeLogged: timeMap[project._id.toString()] || 0
        }));

        res.status(200).json({ projects: projectsWithTime, workspace });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ✅ FIX 2: GET WORKSPACE STATS
// ✅ FIX 2: GET WORKSPACE STATS (UPDATED WITH TIME ROLLUP)
const getWorkspaceStats = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const userId = req.user._id.toString();

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) return res.status(404).json({ message: "Workspace not found" });
        workspace.members = workspace.members.filter(member => member.user !== null);

        const memberData = workspace.members.find(member => member.user.toString() === userId);
        const isMember = !!memberData;
        if (!isMember && workspace.owner.toString() !== userId) {
            return res.status(403).json({ message: "You are not a member of this workspace" });
        }

        // 👑 GOD MODE CHECK
        const isWorkspaceOwner = workspace.owner.toString() === userId;
        const isAdmin = memberData?.role === "admin";

        let projectQuery = { workspace: workspaceId, isArchived: false };
        if (!isWorkspaceOwner && !isAdmin) {
            projectQuery["members.user"] = userId;
        }

        const [totalProjects, projects] = await Promise.all([
            Project.countDocuments(projectQuery),
            Project.find(projectQuery)
                .populate({
                    path: "tasks",
                    match: { isArchived: false },
                    select: "title status dueDate project updatedAt isArchived priority"
                })
                .sort({ createdAt: -1 }),
        ]);

        const totalTasks = projects.reduce((acc, project) => acc + project.tasks.length, 0);
        const totalProjectInProgress = projects.filter((project) => project.status === "In Progress").length;
        const totalTaskCompleted = projects.reduce((acc, project) => acc + project.tasks.filter((task) => task.status === "Done").length, 0);
        const totalTaskToDo = projects.reduce((acc, project) => acc + project.tasks.filter((task) => task.status === "To Do").length, 0);
        const totalTaskInProgress = projects.reduce((acc, project) => acc + project.tasks.filter((task) => task.status === "In Progress").length, 0);

        // ✅ AGGREGATE TOTAL WORKSPACE TIME
        const timeMatchStage = {
            workspace: new mongoose.Types.ObjectId(workspaceId),
            endTime: { $ne: null }
        };

        // If regular member, only sum THEIR time. Admins/Owners see ALL time.
        if (!isWorkspaceOwner && !isAdmin) {
            timeMatchStage.user = new mongoose.Types.ObjectId(userId);
        }

        const timeAggregation = await TimeLog.aggregate([
            { $match: timeMatchStage },
            {
                $group: {
                    _id: null,
                    totalSeconds: { $sum: "$duration" }
                }
            }
        ]);

        const totalWorkspaceTime = timeAggregation.length > 0 ? timeAggregation[0].totalSeconds : 0;

        const tasks = projects.flatMap((project) => project.tasks);
        const now = new Date();
        const next7Days = new Date();
        next7Days.setDate(now.getDate() + 7);

        const upcomingTasks = tasks.filter((task) => {
            if (!task.dueDate || task.isArchived || task.status === "Done") return false;
            const due = new Date(task.dueDate);
            return due >= now && due <= next7Days;
        });

        // Trends & Stats Data
        const taskTrendsData = [
            { name: "Sunday", completed: 0, inProgress: 0, todo: 0 },
            { name: "Monday", completed: 0, inProgress: 0, todo: 0 },
            { name: "Tuesday", completed: 0, inProgress: 0, todo: 0 },
            { name: "Wednesday", completed: 0, inProgress: 0, todo: 0 },
            { name: "Thursday", completed: 0, inProgress: 0, todo: 0 },
            { name: "Friday", completed: 0, inProgress: 0, todo: 0 },
            { name: "Saturday", completed: 0, inProgress: 0, todo: 0 },
        ];
        const last7Days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return d; }).reverse();
        for (const project of projects) {
            for (const task of project.tasks) {
                const taskDate = new Date(task.updatedAt);
                const dayInDate = last7Days.findIndex(d => d.getDate() === taskDate.getDate() && d.getMonth() === taskDate.getMonth());
                if (dayInDate !== -1) {
                    const dayName = last7Days[dayInDate].toLocaleDateString("en-US", { weekday: "long" });
                    const dayData = taskTrendsData.find(d => d.name === dayName);
                    if (dayData) {
                        if (task.status === "Done") dayData.completed++;
                        else if (task.status === "In Progress") dayData.inProgress++;
                        else if (task.status === "To Do") dayData.todo++;
                    }
                }
            }
        }
        const projectStatusData = [
            { name: "Completed", value: 0, color: "#10b981" },
            { name: "In Progress", value: 0, color: "#3b82f6" },
            { name: "Planning", value: 0, color: "#f59e0b" }
        ];

        for (const p of projects) {
            // 1. Calculate the project progress dynamically
            const activeTasks = p.tasks.filter(t => !t.isArchived);
            const totalTasks = activeTasks.length;
            const completedTasks = activeTasks.filter(t => t.status === "Done").length;

            const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

            // 2. Classify based on BOTH progress and explicit status
            if (progress === 100 || ["Completed", "Done"].includes(p.status)) {
                projectStatusData[0].value++; // Count as Completed
            } else if (p.status === "Planning") {
                projectStatusData[2].value++; // Count as Planning
            } else {
                projectStatusData[1].value++; // Count as In Progress
            }
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

        // ✅ ADDED totalWorkspaceTime HERE
        const stats = { totalProjects, totalTasks, totalProjectInProgress, totalTaskCompleted, totalTaskToDo, totalTaskInProgress, totalWorkspaceTime };

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

const inviteUserToWorkspace = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { email, role } = req.body;
        const normalizedEmail = email.toLowerCase().trim();

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) return res.status(404).json({ message: "Workspace not found" });

        const userMemberInfo = workspace.members.find((member) => member.user.toString() === req.user._id.toString());
        if (!userMemberInfo || !["admin", "owner"].includes(userMemberInfo.role)) return res.status(403).json({ message: "Unauthorized" });

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser && workspace.members.some((m) => m.user.toString() === existingUser._id.toString())) return res.status(400).json({ message: "User already in workspace" });

        // ✅ Updated Email HTML: Uses a clean text link instead of a button or raw URL
        const generateEmailHtml = (link, workspaceName, inviterName) => `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
                <h2 style="color: #1f2937; margin-top: 0;">You've been invited to TaskMate! 🎉</h2>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Hello! <br><br>
                    <strong>${inviterName}</strong> has invited you to collaborate in the <strong>${workspaceName}</strong> workspace.
                </p>
                
                <div style="margin: 24px 0;">
                    <a href="${link}" style="color: #2563eb; font-size: 16px; font-weight: bold; text-decoration: underline;">
                        View invitation
                    </a>
                </div>
                
                <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
                    Powered by TaskMate
                </p>
            </div>
        `;

        // Handle Resending an existing invite
        const existingInvite = await WorkspaceInvite.findOne({ email: normalizedEmail, workspaceId, expiresAt: { $gt: new Date() }, status: "pending" });
        if (existingInvite) {
            const invitationLink = `${process.env.FRONTEND_URL}/workspace-invite?token=${existingInvite.token}`;
            const emailContent = generateEmailHtml(invitationLink, workspace.name, req.user.name || "A team member");

            await sendEmail(normalizedEmail, `Invitation to join ${workspace.name}`, emailContent);
            return res.status(200).json({ message: "Resent" });
        }

        // Handle sending a brand new invite
        // ✅ ADDED: workspaceName: workspace.name inside the JWT token!
        const inviteToken = jwt.sign(
            { email: normalizedEmail, workspaceId, workspaceName: workspace.name, role: role || "member" },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        await WorkspaceInvite.create({ user: existingUser?._id, email: normalizedEmail, workspaceId, token: inviteToken, role: role || "member", status: "pending", expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });

        const invitationLink = `${process.env.FRONTEND_URL}/workspace-invite?token=${inviteToken}`;
        const emailContent = generateEmailHtml(invitationLink, workspace.name, req.user.name || "A team member");

        await sendEmail(normalizedEmail, `Invitation to join ${workspace.name}`, emailContent);

        return res.status(200).json({ message: "Sent" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error" });
    }
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
export const getWorkspaceTasks = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const userId = req.user._id;

        // 1. Verify workspace exists and user is a member/owner
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        const isOwner = workspace.owner.toString() === userId.toString();
        const isMember = workspace.members.some(m => m.user.toString() === userId.toString());

        if (!isOwner && !isMember) {
            return res.status(403).json({ message: "Not authorized to view this workspace" });
        }

        // 2. Find all active projects in this workspace
        const projects = await Project.find({
            workspace: workspaceId,
            isArchived: false
        }).select("_id");

        const projectIds = projects.map(p => p._id);

        // 3. Find all active tasks belonging to these projects
        const tasks = await Task.find({
            project: { $in: projectIds },
            isArchived: false
        })
            .populate("project", "title workspace") // Populate project info needed for navigation
            .populate("assignees", "name profilePicture");

        res.status(200).json(tasks);
    } catch (error) {
        console.error("GET WORKSPACE TASKS ERROR:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export {
    createWorkspace,
    getWorkspaces, getWorkspaceDetails, getWorkspaceProjects, getWorkspaceStats,
    getArchivedData, inviteUserToWorkspace, acceptGenerateInvite, acceptInviteByToken,
    updateWorkspace, transferWorkspaceOwnership, deleteWorkspace, removeMemberFromWorkspace
};