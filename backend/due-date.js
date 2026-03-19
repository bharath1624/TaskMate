import cron from "node-cron";
import Task from "./models/task.js";
import Project from "./models/project.js";
import Notification from "./models/notification.js";

export const runDueDateCheck = async (io) => {
    console.log("Running Due Date Check...");

    const now = new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const tomorrowStart = new Date(startOfDay);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const tomorrowEnd = new Date(endOfDay);
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

    try {
        // ===================================================
        // 1️⃣ TASKS DUE TOMORROW
        // ===================================================
        const tasksDueTomorrow = await Task.find({
            dueDate: { $gte: tomorrowStart, $lte: tomorrowEnd },
            status: { $in: ["To Do", "In Progress"] },
            isArchived: false,
        }).populate("project").populate("assignees");

        for (const task of tasksDueTomorrow) {
            if (task.project?.isArchived) continue;

            for (const user of task.assignees || []) {
                const userId = user._id || user;

                const alreadyNotified = await Notification.findOne({
                    user: userId,
                    targetId: task._id,
                    title: "Task Due Tomorrow",
                    createdAt: { $gte: startOfDay }
                });

                if (alreadyNotified) continue;

                const message = `Reminder: Task "${task.title}" is due tomorrow`;

                await Notification.create({
                    user: userId,
                    title: "Task Due Tomorrow",
                    message,
                    targetType: "task",
                    targetId: task._id,
                    projectId: task.project
                });

                io.to(userId.toString()).emit("notification", {
                    title: "Task Due Tomorrow",
                    message
                });
            }
        }

        // ===================================================
        // 2️⃣ TASKS DUE TODAY
        // ===================================================
        const tasksDueToday = await Task.find({
            dueDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $in: ["To Do", "In Progress"] },
            isArchived: false,
        }).populate("project").populate("assignees");

        for (const task of tasksDueToday) {
            if (task.project?.isArchived) continue;

            for (const user of task.assignees || []) {
                const userId = user._id || user;

                const alreadyNotified = await Notification.findOne({
                    user: userId,
                    targetId: task._id,
                    title: "Task Due Today",
                    createdAt: { $gte: startOfDay }
                });

                if (alreadyNotified) continue;

                const message = `Task "${task.title}" is due today`;

                await Notification.create({
                    user: userId,
                    title: "Task Due Today",
                    message,
                    targetType: "task",
                    targetId: task._id,
                    projectId: task.project
                });

                io.to(userId.toString()).emit("notification", {
                    title: "Task Due Today",
                    message
                });
            }
        }

        // ===================================================
        // 3️⃣ OVERDUE TASKS
        // ===================================================
        const tasksOverdue = await Task.find({
            dueDate: { $lt: startOfDay },
            status: { $in: ["To Do", "In Progress"] },
            isArchived: false,
        }).populate("project").populate("assignees");

        for (const task of tasksOverdue) {
            if (task.project?.isArchived) continue;

            // ✅ CALCULATE DAYS OVERDUE
            const taskDueDate = new Date(task.dueDate);
            taskDueDate.setHours(0, 0, 0, 0); // Normalize to midnight for accurate day counting
            const overdueDays = Math.floor((startOfDay - taskDueDate) / (1000 * 60 * 60 * 24));

            // Pluralize "day" vs "days"
            const dayText = overdueDays === 1 ? "day" : "days";

            for (const user of task.assignees || []) {
                const userId = user._id || user;

                const alreadyNotified = await Notification.findOne({
                    user: userId,
                    targetId: task._id,
                    title: "Task Overdue",
                    createdAt: { $gte: startOfDay }
                });

                if (alreadyNotified) continue;

                // ✅ UPDATED MESSAGE WITH DAY COUNT
                const message = `🚨 Overdue by ${overdueDays} ${dayText}: "${task.title}" was due on ${new Date(task.dueDate).toLocaleDateString()}`;

                await Notification.create({
                    user: userId,
                    title: "Task Overdue",
                    message,
                    targetType: "task",
                    targetId: task._id,
                    projectId: task.project
                });

                io.to(userId.toString()).emit("notification", {
                    title: "Task Overdue",
                    message
                });
            }
        }

        // ===================================================
        // 4️⃣ PROJECT DUE / OVERDUE
        // ===================================================
        const projects = await Project.find({
            dueDate: { $exists: true },
            status: { $in: ["Planning", "In Progress", "On Hold"] },
            isArchived: false
        })
            .populate("workspace")
            .populate("workspace.members.user")
            .populate("members.user");

        for (const project of projects) {

            if (!project.dueDate) continue;

            const dueDate = new Date(project.dueDate);
            const today = new Date();
            const startOfDay = new Date(today.setHours(0, 0, 0, 0));

            const diffInDays = Math.floor(
                (dueDate - startOfDay) / (1000 * 60 * 60 * 24)
            );

            const adminRecipients = new Set();
            const ownerRecipients = new Set();

            // Workspace Owner
            if (project.workspace?.owner) {
                ownerRecipients.add(project.workspace.owner.toString());
            }

            // Workspace Admins
            if (project.workspace?.members) {
                project.workspace.members.forEach(m => {
                    if (m.role === "admin") {
                        adminRecipients.add((m.user._id || m.user).toString());
                    }
                });
            }

            let title = "";
            let message = "";

            // ================================
            // 1️⃣ 4 DAYS BEFORE DUE
            // ================================
            if (diffInDays === 4) {
                title = "Project Due Soon";
                message = `Reminder: Project "${project.title}" is due in 4 days.`;
            }

            // ================================
            // 2️⃣ DUE TODAY
            // ================================
            else if (diffInDays === 0) {
                title = "Project Due Today";
                message = `⚠️ Project "${project.title}" is due today.`;
            }

            // ================================
            // 3️⃣ OVERDUE
            // ================================
            else if (diffInDays < 0) {

                title = "Project Overdue";
                message = `🚨 Project "${project.title}" is overdue by ${Math.abs(diffInDays)} days`;

                // After 3 days overdue → escalate to owner
                if (Math.abs(diffInDays) >= 3) {
                    ownerRecipients.forEach(id => adminRecipients.add(id));
                }
            }

            // If no rule matched
            if (!title) continue;

            // Send notification to Admins (and owner if escalated)
            for (const userId of adminRecipients) {

                const alreadyNotified = await Notification.findOne({
                    user: userId,
                    targetId: project._id,
                    title,
                    createdAt: { $gte: startOfDay }
                });

                if (alreadyNotified) continue;

                await Notification.create({
                    user: userId,
                    title,
                    message,
                    targetType: "project",
                    targetId: project._id,
                    projectId: project._id,
                    workspaceId: project.workspace?._id
                });

                io.to(userId).emit("notification", {
                    title,
                    message,
                    type: diffInDays < 0 ? "error" : "warning"
                });
            }
        }
        console.log("✅ Due Date Check Completed");

    } catch (error) {
        console.error("❌ Cron Error:", error);
    }
};

export const setupCronJobs = (io) => {
    // ✅ Run daily at 9:00 AM, explicitly set to Indian Standard Time
    cron.schedule("0 9 * * *", async () => {
        console.log("⏰ Running Scheduled Due Date Check...");
        await runDueDateCheck(io);
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata" // Force the server to run this at 9 AM India time
    });
};
