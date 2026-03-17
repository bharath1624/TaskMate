import { RecentProjects } from "@/components/dashboard/recnt-projects";
import { StatsCard, TimeTrackerStatCard } from "@/components/dashboard/stat-card"; // ✅ Added import here
import { StatisticsCharts } from "@/components/dashboard/statistics-charts";
import { Loader } from "@/components/loader";
import { UpcomingTasks } from "@/components/upcoming-tasks";
import { useGetWorkspaceStatsQuery } from "@/hooks/use-workspace";
import type {
    Project,
    ProjectStatusData,
    StatsCardProps,
    Task,
    TaskPriorityData,
    TaskTrendsData,
    WorkspaceProductivityData,
} from "@/types";
import { useSearchParams } from "react-router";

const Dashboard = () => {
    const [searchParams] = useSearchParams();
    const workspaceId = searchParams.get("workspaceId");

    const { data, isPending } = useGetWorkspaceStatsQuery(workspaceId) as {
        data: {
            stats: StatsCardProps;
            taskTrendsData: TaskTrendsData[];
            projectStatusData: ProjectStatusData[];
            taskPriorityData: TaskPriorityData[];
            workspaceProductivityData: WorkspaceProductivityData[];
            upcomingTasks: Task[];
            recentProjects: Project[];
        };
        isPending: boolean;
    };

    if (!workspaceId) {
        return (
            <div className="flex items-center justify-center h-[70vh]">
                <p className="text-muted-foreground">Please select a workspace</p>
            </div>
        );
    }

    if (isPending) {
        return <Loader />;
    }

    return (
        <div className="space-y-6 lg:space-y-8 pt-7 pb-10">

            {/* ✅ NEW 4+1 GRID LAYOUT */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-6">
                {/* Left side: The 4 normal cards (Takes up 9 out of 12 columns) */}
                <div className="xl:col-span-9">
                    <StatsCard data={data.stats} />
                </div>

                {/* Right side: The new Time Tracker card (Takes up 3 out of 12 columns) */}
                <div className="xl:col-span-3">
                    <TimeTrackerStatCard data={data.stats} />
                </div>
            </div>

            <StatisticsCharts
                stats={data.stats}
                taskTrendsData={data.taskTrendsData}
                projectStatusData={data.projectStatusData}
                taskPriorityData={data.taskPriorityData}
                workspaceProductivityData={data.workspaceProductivityData}
            />

            <div className="grid gap-6 lg:grid-cols-2">
                <RecentProjects data={data.recentProjects} />
                <UpcomingTasks data={data.upcomingTasks} />
            </div>

        </div>
    );
};

export default Dashboard;