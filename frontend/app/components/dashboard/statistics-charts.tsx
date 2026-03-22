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
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
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

    const hasTaskActivity = taskTrendsData.some(
        d => d.completed + d.inProgress + d.todo > 0
    );

    const hasProjectStatus = normalizedProjectStatusData.some(d => d.value > 0);
    const hasTaskPriority = taskPriorityData.some(d => d.value > 0);
    const hasWorkspaceProductivity = workspaceProductivityData.some(
        d => d.total > 0 || d.completed > 0
    );
    return (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="space-y-0.5">
                        <CardTitle className="text-base font-medium">
                            Task Trends
                        </CardTitle>
                        <CardDescription>Daily task activity overview</CardDescription>
                    </div>
                    <ChartLine className="size-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {hasTaskActivity ? (
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={normalizedTaskTrendsData}>

                                    {/* Grid */}
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        strokeOpacity={0.2}
                                    />

                                    {/* X Axis */}
                                    <XAxis
                                        dataKey="name"
                                        tickLine={false}
                                        axisLine={{ strokeWidth: 0.3, stroke: "hsl(var(--border))" }}
                                        fontSize={12}
                                        interval={0}
                                        tickFormatter={(value: string) => value.slice(0, 3)} // 👈 THIS LINE
                                    />

                                    {/* Y Axis */}
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        allowDecimals={false}
                                        fontSize={12}
                                    />

                                    {/* Tooltip */}
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: "8px",
                                            border: "1px solid hsl(var(--border))",
                                            background: "hsl(var(--background))",
                                            padding: "6px 8px",   // ⬅ smaller padding
                                            fontSize: "14px",     // ⬅ smaller text
                                        }}
                                        itemStyle={{
                                            fontSize: "14px",     // ⬅ reduce label size
                                        }}
                                        labelStyle={{
                                            fontSize: "14px",     // ⬅ reduce date/title size
                                        }}
                                    />

                                    {/* COMPLETED */}
                                    <Area
                                        type="monotone"
                                        dataKey="completed"
                                        stroke="#10b981"
                                        fill="#10b981"
                                        fillOpacity={0.15}
                                        strokeWidth={2}
                                        name="Completed"
                                    />

                                    {/* IN PROGRESS */}
                                    <Area
                                        type="monotone"
                                        dataKey="inProgress"
                                        stroke="#3b82f6"
                                        fill="#3b82f6"
                                        fillOpacity={0.15}
                                        strokeWidth={2}
                                        name="In Progress"
                                    />

                                    {/* TODO */}
                                    <Area
                                        type="monotone"
                                        dataKey="todo"
                                        stroke="#6b7280"
                                        fill="#6b7280"
                                        fillOpacity={0.1}
                                        strokeWidth={2}
                                        name="To Do"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-80 flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
                            <ChartLine className="size-8 opacity-40" />
                            <p className="font-medium">No task activity</p>
                        </div>
                    )}
                </CardContent>
                {/* LEGEND BELOW CHART */}
                <div className="flex justify-center gap-4 mt-6 text-xs">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                        Completed
                    </span>
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/30">
                        In Progress
                    </span>
                    <span className="px-3 py-1 rounded-full bg-gray-500/10 text-gray-500 border border-gray-500/30">
                        To Do
                    </span>
                </div>
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
                    <div className="flex flex-col items-center gap-6">
                        {hasProjectStatus ? (
                            <div className="flex flex-col items-center gap-6">
                                {/* PIE CHART */}
                                <ChartContainer
                                    className="h-[280px] w-[300px]"
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
                            </div>) : (
                            <div className="flex flex-col items-center justify-center h-[280px] text-muted-foreground text-sm gap-2">
                                <ChartPie className="size-8 opacity-40" />
                                <p className="font-medium">No project status data</p>
                            </div>
                        )}

                        {/* LEGEND BELOW */}
                        <div className="space-y-3 text-sm w-full max-w-xs">
                            {normalizedProjectStatusData.map(status => (
                                <div
                                    key={status.name}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="h-3 w-3 rounded-sm"
                                            style={{ backgroundColor: status.color }}
                                        />
                                        <span className="font-medium">{status.name}</span>
                                    </div>

                                    <span className="text-muted-foreground font-medium">
                                        {status.value}
                                    </span>
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
                    {hasTaskPriority ? (
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
                                </PieChart>
                            </ChartContainer>
                        </div>
                    ) : (
                        <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
                            <ChartPie className="size-8 opacity-40" />
                            <p className="font-medium">No tasks yet</p>
                        </div>
                    )}
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
                    {hasWorkspaceProductivity ? (
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
                                            tickLine={false}
                                            axisLine={false}
                                            fontSize={12}
                                            interval={0}
                                            // ✅ Use tickFormatter to cut off long names instead of rotating them
                                            tickFormatter={(value) => value.length > 12 ? `${value.substring(0, 12)}...` : value}
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
                                            name="Total Tasks "
                                        />
                                        <Bar
                                            dataKey="completed"
                                            fill="#3b82f6"
                                            radius={[4, 4, 0, 0]}
                                            name="Completed Tasks "
                                        />
                                    </BarChart>
                                </ChartContainer>
                            </div>

                            {/* RIGHT SIDE LEGEND */}
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-3">
                                    <span className="h-3 w-3 bg-black boarder-sm" />
                                    <span>Total Tasks</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="h-3 w-3 bg-blue-500 boarder-sm" />
                                    <span>Completed Tasks</span>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
                            <ChartBarBig className="size-8 opacity-40" />
                            <p className="font-medium">No projects yet</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

    );
};