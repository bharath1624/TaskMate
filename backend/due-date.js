import cron from "node-cron";
import Task from "./models/task.js";
import Notification from "./models/notification.js";
import { io } from "./index.js";

export const dueDateReminderJob = () => {
    // Runs every day at 9 AM server time
    cron.schedule("0 9 * * *", async () => {
        console.log("⏰ Running due date reminder job");

        const now = new Date();
        const twoDaysLater = new Date();
        twoDaysLater.setDate(now.getDate() + 2);

        // Find tasks due within next 2 days
        const tasks = await Task.find({
            dueDate: { $gte: now, $lte: twoDaysLater },
            status: { $ne: "Done" },
            isArchived: false,
        });

        for (const task of tasks) {
            if (!task.assignees || task.assignees.length === 0) continue;

            for (const userId of task.assignees) {
                // Prevent duplicate reminders
                const alreadyNotified = await Notification.findOne({
                    user: userId,
                    targetType: "task",
                    targetId: task._id,
                    title: "Task due soon",
                });

                if (alreadyNotified) continue;

                await Notification.create({
                    user: userId,
                    title: "Task due soon",
                    message: `Task "${task.title}" is due within 2 days`,
                    targetType: "task",
                    targetId: task._id,
                });

                io.to(userId.toString()).emit("notification", {
                    title: "Task due soon",
                    message: `Task "${task.title}" is due within 2 days`,
                    targetType: "task",
                    targetId: task._id,
                });
            }
        }
    });
};
