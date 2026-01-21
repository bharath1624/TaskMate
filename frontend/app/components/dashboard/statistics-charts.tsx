import type {
    ProjectStatusData,
    StatsCardProps,
    TaskPriorityData,
    TaskTrendsData,
    WorkspaceProductivityData,
} from "@/types";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card";
import { ChartBarBig, ChartLine, ChartPie } from "lucide-react";
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "../ui/chart";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    XAxis,
    YAxis,
} from "recharts";

interface StatisticsChartsProps {
    stats: StatsCardProps;
    taskTrendsData: TaskTrendsData[];
    projectStatusData: ProjectStatusData[];
    taskPriorityData: TaskPriorityData[];
    workspaceProductivityData: WorkspaceProductivityData[];
}

export const StatisticsCharts = ({
    stats,
    taskTrendsData,
    projectStatusData,
    taskPriorityData,
    workspaceProductivityData,
}: StatisticsChartsProps) => {
    const ALL_PROJECT_STATUSES = [
        { name: "Completed", color: "#10b981" },
        { name: "In Progress", color: "#3b82f6" },
        { name: "Planning", color: "#f59e0b" },
    ];
    const normalizedProjectStatusData = ALL_PROJECT_STATUSES.map(status => {
        const found = projectStatusData.find(d => d.name === status.name);
        return {
            name: status.name,
            value: found ? found.value : 0,
            color: status.color,
        };
    });
    const normalizedTaskTrendsData = taskTrendsData.map(day => ({
        name: day.name,
        completed: day.completed ?? 0,
        inProgress: day.inProgress ?? 0,
        todo: day.todo ?? 0,
    }));
    const filteredTaskTrendsData = normalizedTaskTrendsData.filter(
        d => d.completed + d.inProgress + d.todo > 0
    );
    const hasTaskActivity = taskTrendsData.some(
        d => d.completed + d.inProgress + d.todo > 0
    );

    return (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="space-y-0.5">
                        <CardTitle className="text-base font-medium">Task Trends</CardTitle>
                        <CardDescription>Daily task status</CardDescription>
                    </div>
                    <ChartLine className="size-5 text-muted-foreground" />
                </CardHeader>
                <CardContent className="w-full overflow-x-auto md:overflow-x-hidden">
                    <div className="min-w-[350px]">
                        {hasTaskActivity ? (
                            <ChartContainer
                                className="h-[360px]"
                                config={{
                                    completed: { color: "#10b981" },
                                    inProgress: { color: "#3b82f6" },
                                    todo: { color: "#6b7280" },
                                }}
                            >
                                <BarChart
                                    data={taskTrendsData}
                                    layout="vertical"
                                    barGap={0}
                                    barCategoryGap={8}
                                >
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        tickLine={false}
                                        axisLine={false}
                                        fontSize={12}
                                        padding={{ top: 0, bottom: 0 }}
                                    />
                                    <XAxis
                                        type="number"
                                        allowDecimals={false}
                                        domain={[0, "dataMax + 1"]}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <ChartLegend content={<ChartLegendContent />} />

                                    <Bar dataKey="completed" fill="#10b981" barSize={18} radius={[0, 4, 4, 0]} />
                                    <Bar dataKey="inProgress" fill="#3b82f6" barSize={18} radius={[0, 4, 4, 0]} />
                                    <Bar dataKey="todo" fill="#6b7280" barSize={18} radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ChartContainer>
                        ) : (
                            <div className="h-[360px] flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
                                <ChartLine className="size-8 opacity-40" />
                                <p className="font-medium">No task activity yet</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* project status  */}

            <Card className="h-full">

                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="space-y-0.5">
                        <CardTitle className="text-base font-medium">
                            Project Status
                        </CardTitle>
                        <CardDescription>Status breakdown</CardDescription>
                    </div>

                    <ChartPie className="size-5 text-muted-foreground" />
                </CardHeader>

                <CardContent>
                    <div className="flex items-center gap-8">

                        {/* Pie Chart */}
                        <ChartContainer
                            className="h-[260px] w-[260px]"
                            config={{
                                Completed: { color: "#10b981" },
                                "In Progress": { color: "#3b82f6" },
                                Planning: { color: "#f59e0b" },
                            }}
                        >
                            <PieChart>
                                <Pie
                                    data={normalizedProjectStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={95}
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={({ percent }) =>
                                        percent > 0 ? `${(percent * 100).toFixed(0)}%` : ""
                                    }
                                    labelLine={false}
                                >
                                    {normalizedProjectStatusData.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ChartContainer>

                        {/* RIGHT SIDE: Color + Name ONLY */}
                        <div className="space-y-3 text-sm">
                            {normalizedProjectStatusData.map(status => (
                                <div key={status.name} className="flex items-center gap-3">
                                    <span
                                        className="h-3 w-3"
                                        style={{ backgroundColor: status.color }}
                                    />

                                    <span className="font-medium">{status.name}</span>
                                </div>
                            ))}
                        </div>

                    </div>
                </CardContent>
            </Card>

            {/* task priority  */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="space-y-0.5">
                        <CardTitle className="text-base font-medium">
                            Task Priority
                        </CardTitle>
                        <CardDescription>Priority breakdown</CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="w-full overflow-x-auto md:overflow-x-hidden">
                    <div className="min-w-[350px]">
                        <ChartContainer
                            className="h-[300px]"
                            config={{
                                High: { color: "#ef4444" },
                                Medium: { color: "#f59e0b" },
                                Low: { color: "#6b7280" },
                            }}
                        >
                            <PieChart>
                                <Pie
                                    data={taskPriorityData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    minAngle={10}
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, percent }) =>
                                        percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ""
                                    }
                                    labelLine={false}
                                >
                                    {taskPriorityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <ChartTooltip />
                                <ChartLegend content={<ChartLegendContent />} />
                            </PieChart>
                        </ChartContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Workspace Productivity Chart */}
            <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="space-y-0.5">
                        <CardTitle className="text-base font-medium">
                            Workspace Productivity
                        </CardTitle>
                        <CardDescription>Tasks done in project</CardDescription>
                    </div>
                    <ChartBarBig className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent className="w-full overflow-x-auto md:overflow-x-hidden">
                    <div className="flex gap-6 items-center min-w-[350px]">

                        {/* Chart */}
                        <div className="flex-1">
                            <ChartContainer
                                className="h-[300px]"
                                config={{
                                    completed: { color: "#3b82f6" },
                                    total: { color: "#000000" },
                                }}
                            >
                                <BarChart
                                    data={workspaceProductivityData}
                                    barGap={0}
                                    barSize={20}
                                >
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <ChartTooltip content={<ChartTooltipContent />} />

                                    <Bar
                                        dataKey="total"
                                        fill="#000"
                                        radius={[4, 4, 0, 0]}
                                        name="Total Tasks"
                                    />
                                    <Bar
                                        dataKey="completed"
                                        fill="#3b82f6"
                                        radius={[4, 4, 0, 0]}
                                        name="Completed Tasks"
                                    />
                                </BarChart>
                            </ChartContainer>
                        </div>

                        {/* RIGHT SIDE LEGEND */}
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-3">
                                <span className="h-3 w-3 bg-black rounded-sm" />
                                <span>Total Tasks</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="h-3 w-3 bg-blue-500 rounded-sm" />
                                <span>Completed Tasks</span>
                            </div>
                        </div>

                    </div>
                </CardContent>
            </Card>
        </div>
    );
};