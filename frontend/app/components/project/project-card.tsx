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
import { format, isPast, isToday } from "date-fns";
import { CalendarDays, ClockAlert, Clock, LayoutList } from "lucide-react";

// Quick helper to format seconds into hours & minutes
const formatDuration = (seconds: number): string => {
    if (!seconds || seconds <= 0) return "0h 0m";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
};

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

    // 1. Calculate Status & Overdue
    const dueDate = project.dueDate ? new Date(project.dueDate) : null;

    // ✅ FIX: Force isCompleted to be true if progress hits 100%
    const isCompleted = progress === 100 || ["Completed", "Done"].includes(project.status);

    // Because isCompleted is true at 100%, isOverdue will automatically become false!
    const isOverdue = dueDate && isPast(dueDate) && !isToday(dueDate) && !isCompleted;
    const isDueToday = dueDate && isToday(dueDate) && !isCompleted;

    return (
        <Link to={`/workspaces/${workspaceId}/projects/${project._id}`}>
            <Card className="transition-all duration-300 hover:shadow-md hover:-translate-y-1 h-full flex flex-col justify-between group border-border/60">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                        <CardTitle className="line-clamp-2 text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                            {project.title}
                        </CardTitle>
                        <span
                            className={cn(
                                "text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border font-semibold whitespace-nowrap",
                                // ✅ FIX: If completed, apply exact green classes directly. Otherwise, use the normal color function.
                                isCompleted
                                    ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400"
                                    : getTaskStatusColor(project.status as any)
                            )}
                        >
                            {isCompleted ? "COMPLETED" : project.status}
                        </span>
                    </div>
                    <CardDescription className="line-clamp-2 mt-2 h-10 text-sm">
                        {project.description || "No description provided."}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="space-y-4">

                        {/* PROGRESS BAR */}
                        <div className="space-y-1.5 bg-muted/20 p-2.5 rounded-lg border border-border/40">
                            <div className="flex justify-between text-[11px] font-semibold uppercase tracking-wider">
                                <span className={isOverdue ? "text-red-600" : "text-muted-foreground"}>
                                    Progress
                                </span>
                                <span className={isOverdue ? "text-red-600" : "text-foreground"}>{progress}%</span>
                            </div>
                            <Progress
                                value={progress}
                                className={cn(
                                    "h-1.5",
                                    isOverdue ? "[&>div]:bg-red-500 bg-red-100" : "[&>div]:bg-primary"
                                )}
                            />
                        </div>

                        {/* BOTTOM METADATA ROW */}
                        <div className="flex items-end justify-between pt-1">

                            {/* Left Side: Tasks & Time Logged */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center text-xs font-medium text-muted-foreground gap-1.5 bg-muted/40 w-fit px-2 py-1 rounded-md">
                                    <LayoutList className="size-3.5" />
                                    <span>{project.tasks.length} Tasks</span>
                                </div>

                                {/* Time Logged Badge */}
                                {(project.totalTimeLogged !== undefined && project.totalTimeLogged > 0) && (
                                    <div className="flex items-center text-xs font-medium text-blue-600 dark:text-blue-400 gap-1.5 bg-blue-50 dark:bg-blue-900/20 w-fit px-2 py-1 rounded-md border border-blue-100 dark:border-blue-900/50">
                                        <Clock className="size-3.5" />
                                        <span>{formatDuration(project.totalTimeLogged)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Right Side: DUE DATE */}
                            {dueDate && (
                                <div className={cn(
                                    "flex flex-col items-end gap-1 text-xs",
                                    isOverdue ? "text-red-600" : isDueToday ? "text-amber-600" : "text-muted-foreground"
                                )}>
                                    <div className="flex items-center gap-1 opacity-80 font-medium tracking-wide uppercase text-[10px]">
                                        {isOverdue ? <ClockAlert className="w-3 h-3" /> : <CalendarDays className="w-3 h-3" />}
                                        <span>{isOverdue ? "Overdue" : isDueToday ? "Due Today" : "Deadline"}</span>
                                    </div>
                                    <span className={cn(
                                        "font-semibold bg-background border px-2 py-1 rounded-md shadow-sm",
                                        isOverdue ? "border-red-200 bg-red-50 dark:bg-red-950/30" : "border-border/60"
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