import type { Project } from "@/types";
import { Link } from "react-router";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card";
import { cn } from "@/lib/utils";
import { getTaskStatusColor } from "@/lib";
import { Progress } from "../ui/progress";
import { format, isPast, isToday } from "date-fns"; // ✅ Import date helpers
import { CalendarDays, ClockAlert } from "lucide-react"; // ✅ Import Alert Icon

interface ProjectCardProps {
    project: Project;
    progress: number;
    workspaceId: string;
}

export const ProjectCard = ({
    project,
    progress,
    workspaceId,
}: ProjectCardProps) => {

    // 1. Calculate Overdue Status
    const dueDate = project.dueDate ? new Date(project.dueDate) : null;
    const isCompleted = ["Completed", "Done"].includes(project.status);

    // It is overdue if: Date exists + Date is in past + Not Today + Not Completed
    const isOverdue = dueDate && isPast(dueDate) && !isToday(dueDate) && !isCompleted;
    const isDueToday = dueDate && isToday(dueDate) && !isCompleted;

    return (
        <Link to={`/workspaces/${workspaceId}/projects/${project._id}`}>
            <Card className="transition-all duration-300 hover:shadow-md hover:translate-y-1 h-full flex flex-col justify-between">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="line-clamp-1 text-lg">{project.title}</CardTitle>
                        <span
                            className={cn(
                                "text-xs px-2 py-1 rounded-full border font-medium",
                                getTaskStatusColor(project.status)
                            )}
                        >
                            {project.status}
                        </span>
                    </div>
                    <CardDescription className="line-clamp-2 mt-2 h-10">
                        {project.description || "No description provided."}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="space-y-2">
                        {/* PROGRESS BAR */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs font-large">
                                <span className={isOverdue ? "text-red-600" : "text-muted-foreground"}>
                                    {isOverdue ? "Progress" : "Progress"}
                                </span>
                                <span className={isOverdue ? "text-red-600" : ""}>{progress}%</span>
                            </div>

                            {/* ✅ Turn Progress Bar RED if overdue */}
                            <Progress
                                value={progress}
                                className={cn(
                                    "h-2",
                                    isOverdue ? "[&>div]:bg-red-600 bg-red-100" : ""
                                )}
                            />
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            {/* Task Count */}
                            <div className="flex items-center text-xs gap-2 text-muted-foreground">
                                <span>{project.tasks.length}</span>
                                <span>Tasks</span>
                            </div>

                            {/* DUE DATE DISPLAY */}
                            {dueDate && (
                                <div className={cn(
                                    "flex flex-col items-end gap-0.5 text-xs",
                                    isOverdue ? "text-red-600" : isDueToday ? "text-amber-600" : "text-muted-foreground"
                                )}>
                                    <div className="flex items-center gap-1 opacity-80">
                                        {isOverdue ? <ClockAlert className="w-3.5 h-3.5" /> : <CalendarDays className="w-3.5 h-3.5" />}
                                        <span>{isOverdue ? "Overdue" : isDueToday ? "Due Today" : "Due Date"}</span>
                                    </div>
                                    <span className={cn(
                                        "font-medium",
                                        isOverdue ? "font-bold" : ""
                                    )}>
                                        {format(dueDate, "MMM d, yyyy")}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
};