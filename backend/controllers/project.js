import Workspace from "../models/workspace.js";
import Project from "../models/project.js";
import Task from "../models/task.js";
import Notification from "../models/notification.js";

const isWorkspaceOwner = (workspace, userId) => {
    if (!workspace) return false;

    // 1. Check Top-Level Owner Field (Safest)
    if (workspace.owner && workspace.owner.toString() === userId.toString()) {
        return true;
    }

    // 2. Check Members Array (Fallback)
    if (workspace.members) {
        const member = workspace.members.find(m => {
            // Handle cases where m.user is populated (Object) or raw (ObjectId)
            const id = m.user._id || m.user;
            return id.toString() === userId.toString();
        });
        return member && member.role === 'owner';
    }

    return false;
};

const isWorkspaceAdmin = (workspace, userId) => {
    if (!workspace || !workspace.members) return false;
    const member = workspace.members.find(m => {
        const id = m.user._id || m.user;
        return id && id.toString() === userId.toString();
    });
    return member && member.role === 'admin';
};

const createProject = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { title, description, status, startDate, dueDate, members = [] } = req.body;

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) return res.status(404).json({ message: "Workspace not found" });

        // Ensure Creator is in the workspace
        const creatorWorkspaceMember = workspace.members.find(
            (member) => member.user.toString() === req.user._id.toString()
        );

        if (!creatorWorkspaceMember) {
            return res.status(403).json({ message: "You are not a member of this workspace" });
        }

        // Add Creator to Project Members automatically
        const uniqueMembers = new Set([
            req.user._id.toString(),
            ...members,
        ]);

        const projectMembers = [...uniqueMembers].map(userId => {
            return {
                user: userId,
                // Creator gets 'admin' role in the project
                role: userId === req.user._id.toString() ? "admin" : "member"
            };
        });

        const project = await Project.create({
            title, description, status, startDate, dueDate,
            workspace: workspaceId,
            members: projectMembers,
            createdBy: req.user._id,
        });

        workspace.projects.push(project._id);
        await workspace.save();

        // Notifications logic (same as before)...
        for (const userId of uniqueMembers) {
            if (userId === req.user._id.toString()) continue;
            await Notification.create({
                user: userId,
                title: "Project Assigned",
                message: `You were assigned to the project "${project.title}"`,
                targetType: "project",
                targetId: project._id,
                workspaceId: project.workspace,
            });
            if (global.io) {
                global.io.to(userId).emit("notification", {
                    title: "New Project",
                    message: `You were added to ${project.title}`,
                });
            }
        }

        return res.status(201).json(project);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const getProjectTasks = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user._id.toString();

        const project = await Project.findById(projectId).populate("members.user", "name email profilePicture");
        if (!project) return res.status(404).json({ message: "Project not found" });

        const workspace = await Workspace.findById(project.workspace).populate("members.user", "name email profilePicture");
        if (!workspace) return res.status(404).json({ message: "Workspace not found" });

        // 1. Determine Roles
        const isOwner = isWorkspaceOwner(workspace, userId);
        const isAdmin = isWorkspaceAdmin(workspace, userId); // New Check
        const isProjectMember = project.members.some(m => m.user._id.toString() === userId);

        // 2. Access Check (Owner/Admin can see everything, Member must be assigned)
        // If you are an Admin but NOT added to project, usually you can't see it (unless God mode logic applied to admins too).
        // Assuming Admin MUST be added to see it, OR assume Admin sees all like Owner. 
        // Based on your prompt "if he is added into that project", we stick to isProjectMember check for non-owners.
        if (!isOwner && !isProjectMember) {
            return res.status(403).json({ message: "Access denied." });
        }

        // 3. Determine Editing Rights (Buttons)
        const projectMemberDef = project.members.find(m => m.user._id.toString() === userId);
        const isProjectAdminRole = projectMemberDef?.role === 'admin';

        // ✅ FIX: Grant edit rights if Owner OR Workspace Admin OR Project Admin
        const canEdit = isOwner || isAdmin || isProjectAdminRole;

        // 4. Task Filtering
        let query = { project: projectId, isArchived: false };

        const tasks = await Task.find(query).populate("assignees", "name profilePicture").sort({ createdAt: -1 });

        res.status(200).json({
            project,
            workspaceMembers: workspace.members,
            tasks,
            canEdit // <--- This will now be TRUE for Admins
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ✅ 4. GET PROJECT DETAILS (FIXED: Checks for Workspace Admin)
const getProjectDetails = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user._id.toString();

        const project = await Project.findById(projectId).populate("members.user", "name email profilePicture");
        if (!project) return res.status(404).json({ message: "Project not found" });

        const workspace = await Workspace.findById(project.workspace).populate("members.user", "name email profilePicture");
        if (!workspace) return res.status(404).json({ message: "Workspace not found" });

        const isOwner = isWorkspaceOwner(workspace, userId);
        const isAdmin = isWorkspaceAdmin(workspace, userId); // New Check
        const isProjectMember = project.members.some(m => m.user._id.toString() === userId);
        const projectMemberDef = project.members.find(m => m.user._id.toString() === userId);
        const isProjectAdminRole = projectMemberDef?.role === 'admin';

        if (!isOwner && !isProjectMember) return res.status(403).json({ message: "Access denied" });

        // ✅ FIX: Grant edit rights if Owner OR Workspace Admin OR Project Admin
        const canEdit = isOwner || isAdmin || isProjectAdminRole;

        res.status(200).json({
            project,
            workspaceMembers: workspace.members,
            canEdit
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
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
        const { title, description, status, startDate, dueDate, members } = req.body;
        const userId = req.user._id.toString();

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: "Project not found" });

        const workspace = await Workspace.findById(project.workspace);
        const isOwner = isWorkspaceOwner(workspace, userId);
        const isProjectMember = project.members.some(m => m.user.toString() === userId);

        // Check Permissions
        if (!isOwner && !isProjectMember) {
            return res.status(403).json({ message: "You are not allowed to update this project" });
        }

        // Apply Basic Updates
        if (title) project.title = title;
        if (description) project.description = description;
        if (status) project.status = status;
        if (startDate) project.startDate = startDate;
        if (dueDate) project.dueDate = dueDate;

        // ✅ HANDLE MEMBER UPDATES & NOTIFICATIONS
        if (members) {
            const oldMemberIds = project.members.map(m => m.user.toString());
            const newMemberIds = members; // Array of strings from frontend

            // 1. Update List with Role Logic
            project.members = members.map(memberId => {
                // A. Check if they were already in the project (Keep existing role)
                const existing = project.members.find(m => m.user.toString() === memberId);
                if (existing) {
                    return { user: memberId, role: existing.role };
                }

                // B. If NEW member, Inherit from Workspace Role
                // If they are 'owner' or 'admin' in Workspace, make them 'admin' in Project
                const wsMember = workspace.members.find(m => m.user.toString() === memberId);
                const isWsAdmin = wsMember && ["owner", "admin"].includes(wsMember.role);

                return {
                    user: memberId,
                    role: isWsAdmin ? 'admin' : 'member'
                };
            });

            // Ensure Creator stays Admin if in list
            const creatorInList = project.members.find(m => m.user.toString() === project.createdBy.toString());
            if (creatorInList) creatorInList.role = 'admin';

            // 2. Calculate Diffs for Notifications
            const addedMembers = newMemberIds.filter(id => !oldMemberIds.includes(id));
            const removedMembers = oldMemberIds.filter(id => !newMemberIds.includes(id));

            // 3. Send "Added" Notifications
            for (const id of addedMembers) {
                if (id === userId) continue; // Don't notify self
                await Notification.create({
                    user: id,
                    title: "Added to Project",
                    message: `You were added to the project "${project.title}"`,
                    targetType: "project",
                    targetId: project._id,
                    workspaceId: project.workspace,
                });
                if (global.io) {
                    global.io.to(id).emit("notification", {
                        title: "Added to Project",
                        message: `You were added to ${project.title}`,
                    });
                }
            }

            // 4. Send "Removed" Notifications
            for (const id of removedMembers) {
                if (id === userId) continue;
                await Notification.create({
                    user: id,
                    title: "Removed from Project",
                    message: `You were removed from the project "${project.title}"`,
                    targetType: "project",
                    targetId: project._id,
                    workspaceId: project.workspace,
                });
                if (global.io) {
                    global.io.to(id).emit("notification", {
                        title: "Removed from Project",
                        message: `You were removed from ${project.title}`,
                    });
                }
            }
        }

        await project.save();
        res.status(200).json({ message: "Project updated", project });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update project" });
    }
};

const deleteProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user._id.toString();

        // 1. Fetch Project
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: "Project not found" });

        const workspace = await Workspace.findById(project.workspace);
        if (!workspace) return res.status(404).json({ message: "Workspace not found" });

        // 2. Permission Check
        const isOwner = isWorkspaceOwner(workspace, userId);
        const isCreator = project.createdBy.toString() === userId;

        if (!isCreator && !isOwner) {
            return res.status(403).json({ message: "Only the Creator or Workspace Owner can delete this project" });
        }

        // 3. 🔔 ROBUST NOTIFICATION LIST GENERATION
        const deleterName = req.user.name;
        const recipientSet = new Set();

        // A. Add all Project Members (Safe ID Extraction)
        project.members.forEach(member => {
            // Handle if 'user' is an Object (populated) or just an ID string
            const id = member.user._id || member.user;
            if (id) recipientSet.add(id.toString());
        });

        // B. Add Workspace Owner (if not already in list)
        if (workspace.owner) {
            recipientSet.add(workspace.owner.toString());
        }

        // C. Remove the person deleting (Don't notify yourself)
        recipientSet.delete(userId);

        // 4. Cleanup Data
        await Task.deleteMany({ project: projectId });

        await Workspace.findByIdAndUpdate(project.workspace, {
            $pull: { projects: projectId },
        });

        await Notification.deleteMany({
            targetType: "project",
            targetId: projectId,
        });

        // 5. Delete Project
        await Project.findByIdAndDelete(projectId);

        // 6. Send Notifications
        const notificationPromises = Array.from(recipientSet).map(async (recipientId) => {
            // Create DB Entry
            await Notification.create({
                user: recipientId,
                title: "Project Deleted",
                message: `${deleterName} deleted the project "${project.title}"`,
                targetType: "workspace", // Redirect to workspace
                targetId: project.workspace,
                workspaceId: project.workspace,
            });

            // Emit Socket Event
            if (global.io) {
                global.io.to(recipientId).emit("notification", {
                    title: "Project Deleted",
                    message: `${deleterName} deleted the project "${project.title}"`,
                    targetType: "workspace",
                    targetId: project.workspace,
                    workspaceId: project.workspace, // Include this for frontend routing
                });
            }
        });

        await Promise.all(notificationPromises);

        res.status(200).json({ message: "Project deleted permanently" });

    } catch (error) {
        console.error("Delete Project Error:", error);
        res.status(500).json({ message: "Failed to delete project" });
    }
};
const getAllProjectsInWorkspace = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const currentUserId = req.user._id.toString(); // Current logged in user

        // 1. Fetch Workspace
        const workspace = await Workspace.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        // 2. FORCE CHECK: Is this user the Top-Level Owner?
        // We convert both to strings to ensure strict comparison works
        const workspaceOwnerId = workspace.owner.toString();
        const isOwner = workspaceOwnerId === currentUserId;
        // 3. BUILD QUERY
        let query = {
            workspace: workspaceId,
            isArchived: false
        };

        // 4. APPLY FILTER ONLY IF NOT OWNER
        // If isOwner is true, we SKIP this block entirely.
        if (!isOwner) {
            query["members.user"] = currentUserId;
        }

        // 5. FETCH
        const projects = await Project.find(query)
            .populate("members.user", "name email profilePicture") // Optional: nicer UI data
            .sort({ createdAt: -1 });

        res.status(200).json(projects);

    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
export { createProject, getProjectDetails, getProjectTasks, archiveProject, toggleArchiveProject, updateProject, deleteProject, getAllProjectsInWorkspace }; 