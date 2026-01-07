
import { RecentProjects } from "@/components/dashboard/recnt-projects";
import { StatsCard } from "@/components/dashboard/stat-card";
import { StatisticsCharts } from "@/components/dashboard/statistics-charts";
import { Loader } from "@/components/loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
                <p className="text-muted-foreground">
                    Please select a workspace
                </p>
            </div>
        );
    }

    if (isPending) {
        return (
            <div>
                <Loader />
            </div>
        );
    }

    return (
        <div className="space-y-8 2xl:space-y-12 pt-6">
            <StatsCard data={data.stats} />
            <StatisticsCharts
                stats={data.stats}
                taskTrendsData={data.taskTrendsData}
                projectStatusData={data.projectStatusData}
                taskPriorityData={data.taskPriorityData}
                workspaceProductivityData={data.workspaceProductivityData}
            />

            <div className="grid gap-6 lg:grid-cols-2">
                <RecentProjects data={data.recentProjects} />

                {data.upcomingTasks.length === 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Tasks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-center text-muted-foreground py-8">
                                No upcoming tasks yet
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <UpcomingTasks data={data.upcomingTasks} />
                )}
            </div>

        </div>
    );
};

export default Dashboard;
