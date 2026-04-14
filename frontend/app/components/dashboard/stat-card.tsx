import type { StatsCardProps } from "@/types";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../ui/card";
import { FolderKanban, CheckSquare, ListTodo, Loader2, Clock } from "lucide-react";

// Helper to format seconds
const formatDuration = (seconds: number): string => {
    if (!seconds || seconds <= 0) return "0h 0m";

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);

    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
};

// 1. The original 4 cards
export const StatsCard = ({ data }: { data: StatsCardProps }) => {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 h-full">
            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                    <FolderKanban className="h-4 w-4 text-muted-foreground opacity-70" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.totalProjects}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {data.totalProjectInProgress} in progress
                    </p>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                    <CheckSquare className="h-4 w-4 text-muted-foreground opacity-70" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.totalTasks}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {data.totalTaskCompleted} completed
                    </p>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">To Do</CardTitle>
                    <ListTodo className="h-4 w-4 text-muted-foreground opacity-70" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.totalTaskToDo}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Tasks to be done
                    </p>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                    <Loader2 className="h-4 w-4 text-muted-foreground opacity-70" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.totalTaskInProgress}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Tasks in progress
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

// 2. The NEW standalone Time Tracker Card
export const TimeTrackerStatCard = ({ data }: { data: StatsCardProps }) => {
    return (
        <Card className="h-full shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Time Tracked
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight">
                    {formatDuration(data.totalWorkspaceTime || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    Across all Projects
                </p>
            </CardContent>
        </Card>
    );
};