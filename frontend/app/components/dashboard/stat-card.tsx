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
    if (!seconds || seconds <= 0) return "0H 0M";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}H ${m}M`;
    return `${m}M`;
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
        <Card className="h-full relative overflow-hidden bg-linear-to-br from-blue-600 to-indigo-900 border-none text-white shadow-md">
            {/* Beautiful background glow effects */}
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 blur-2xl rounded-full pointer-events-none"></div>
            <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-blue-400/20 blur-xl rounded-full pointer-events-none"></div>

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-blue-100 uppercase tracking-wider">Total Time Worked</CardTitle>
                <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-sm">
                    <Clock className="h-4 w-4 text-white" />
                </div>
            </CardHeader>
            <CardContent className="relative z-10 mt-1">
                <div className="text-4xl font-bold font-mono tracking-tight drop-shadow-md">
                    {formatDuration(data.totalWorkspaceTime || 0)}
                </div>
                <p className="text-xs text-blue-200 mt-2 font-medium">
                    Across all projects
                </p>
            </CardContent>
        </Card>
    );
};