import { Loader } from "@/components/loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { priorityStyles, statusStyles } from "@/lib/task-util";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetMyTasksQuery } from "@/hooks/use-task";
import { useGetWorkspaceDetailsQuery } from "@/hooks/use-workspace"; // ✅ Added to check Admin/Owner roles
import type { Task } from "@/types";
import { format } from "date-fns";
import { ArrowUpRight, CheckCircle, Clock, FilterIcon, CalendarIcon, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useAuth } from "@/provider/auth-context";

const MyTasks = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useAuth();

    // ✅ EXTRACT IDs & PARAMS FROM URL
    const workspaceId = searchParams.get("workspaceId");
    const dateParam = searchParams.get("date"); // ✅ FIXED: dateParam is defined here!

    const initialFilter = searchParams.get("filter") || "all";
    const initialSort = searchParams.get("sort") || "desc";
    const initialSearch = searchParams.get("search") || "";

    const [filter, setFilter] = useState<string>(initialFilter);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
        initialSort === "asc" ? "asc" : "desc"
    );
    const [search, setSearch] = useState<string>(initialSearch);

    // ✅ FUNCTION TO CLEAR DATE FILTER
    const clearDateFilter = () => {
        const params: Record<string, string> = {};
        searchParams.forEach((value, key) => {
            if (key !== "date") params[key] = value; // Keep everything EXCEPT the date
        });
        setSearchParams(params, { replace: true });
    };

    // Update URL when state changes
    useEffect(() => {
        const params: Record<string, string> = {};

        searchParams.forEach((value, key) => {
            params[key] = value;
        });

        params.filter = filter;
        params.sort = sortDirection;
        params.search = search;

        // Preserve workspace and date if they exist
        if (workspaceId) params.workspaceId = workspaceId;
        if (dateParam) params.date = dateParam;

        setSearchParams(params, { replace: true });
    }, [filter, sortDirection, search, workspaceId, dateParam, searchParams, setSearchParams]);

    // Update state when URL changes
    useEffect(() => {
        const urlFilter = searchParams.get("filter") || "all";
        const urlSort = searchParams.get("sort") || "desc";
        const urlSearch = searchParams.get("search") || "";

        if (urlFilter !== filter) setFilter(urlFilter);
        if (urlSort !== sortDirection) setSortDirection(urlSort === "asc" ? "asc" : "desc");
        if (urlSearch !== search) setSearch(urlSearch);
    }, [searchParams]);

    // ✅ 1. FETCH WORKSPACE DETAILS (To check if user is Admin/Owner)
    const { data: workspace } = useGetWorkspaceDetailsQuery(workspaceId || "");
    const isOwner = workspace?.owner === user?._id;
    const currentMember = workspace?.members?.find((m: any) =>
        (m.user?._id || m.user) === user?._id
    );
    const isAdmin = currentMember?.role === "admin";
    const showYouBadge = isOwner || isAdmin; // Only show "(You)" badge for Admins/Owners

    // ✅ 2. FETCH TASKS
    const { data: myTasks, isLoading } = useGetMyTasksQuery(workspaceId) as {
        data: Task[];
        isLoading: boolean;
    };

    // ✅ 3. FILTER TASKS (Including the new date filter!)
    const filteredTasks =
        myTasks?.length > 0
            ? myTasks
                .filter((task) => {
                    if (filter === "all") return true;
                    if (filter === "todo") return task.status === "To Do";
                    if (filter === "inprogress") return task.status === "In Progress";
                    if (filter === "done") return task.status === "Done";
                    if (filter === "high") return task.priority === "High";
                    return true;
                })
                .filter((task) =>
                    task.title.toLowerCase().includes(search.toLowerCase()) ||
                    task.description?.toLowerCase().includes(search.toLowerCase())
                )
                .filter((task) => {
                    // DATE FILTER LOGIC
                    if (!dateParam) return true; // If no date in URL, show everything
                    if (!task.dueDate) return false; // If searching by date, hide tasks with no date

                    const taskDateString = format(new Date(task.dueDate), "yyyy-MM-dd");
                    return taskDateString === dateParam;
                })
            : [];

    const sortedTasks = [...filteredTasks].sort((a, b) => {
        if (a.dueDate && b.dueDate) {
            return sortDirection === "asc"
                ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
                : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        }
        return 0;
    });

    const todoTasks = sortedTasks.filter((task) => task.status === "To Do");
    const inProgressTasks = sortedTasks.filter((task) => task.status === "In Progress");
    const doneTasks = sortedTasks.filter((task) => task.status === "Done");

    // Helper to check if task is assigned to the current user
    const checkIsAssignedToMe = (task: any) => {
        if (!task.assignees || !user) return false;
        return task.assignees.some((assignee: any) =>
            (assignee._id || assignee).toString() === user._id.toString()
        );
    };

    if (isLoading) return <div><Loader /></div>;

    return (
        <div className="space-y-6 pt-5">
            <div className="flex items-start md:items-center justify-between">
                <h1 className="text-2xl font-bold">My Tasks</h1>

                <div className="flex flex-col items-start md:flex-row md gap-2">
                    <Button
                        variant={"outline"}
                        onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                    >
                        {sortDirection === "asc" ? "Old to New" : "New to Old"}
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant={"outline"}>
                                <FilterIcon className="w-4 h-4" /> Filter
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setFilter("all")}>All Tasks</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilter("todo")}>To Do</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilter("inprogress")}>In Progress</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilter("done")}>Done</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilter("high")}>High</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <Input
                placeholder="Search tasks "
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-lg"
            />

            {/* ✅ CALENDAR DATE FILTER BANNER */}
            {dateParam && (
                <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2.5 rounded-lg w-fit border border-primary/20 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <CalendarIcon className="w-4 h-4" />
                    <span className="text-sm font-semibold">
                        Tasks due on: {format(new Date(dateParam), "MMMM dd, yyyy")}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-2 hover:bg-primary/20 text-primary rounded-full transition-colors"
                        onClick={clearDateFilter}
                        title="Clear date filter"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            )}

            <Tabs defaultValue="list">
                <TabsList>
                    <TabsTrigger value="list">List View</TabsTrigger>
                    <TabsTrigger value="board">Board View</TabsTrigger>
                </TabsList>

                {/* ======================= */}
                {/* LIST VIEW               */}
                {/* ======================= */}
                <TabsContent value="list">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Tasks</CardTitle>
                            <CardDescription>
                                {sortedTasks?.length} tasks found
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className="divide-y">
                                {sortedTasks?.map((task) => {
                                    const isAssignedToMe = checkIsAssignedToMe(task);
                                    return (
                                        <div key={task._id} className="p-4 hover:bg-muted/50 transition-colors">
                                            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 items-start">
                                                <div className="flex gap-3">
                                                    {task.status === "Done" ? (
                                                        <CheckCircle className="size-4 text-green-500 mt-1 shrink-0" />
                                                    ) : (
                                                        <Clock className="size-4 text-yellow-500 mt-1 shrink-0" />
                                                    )}

                                                    <div>
                                                        <Link
                                                            to={`/workspaces/${task.project.workspace._id || task.project.workspace}/projects/${task.project._id}/tasks/${task._id}`}
                                                            className="font-medium hover:text-primary hover:underline flex items-center gap-2 flex-wrap"
                                                        >
                                                            {task.title}
                                                            {/* ✅ YOU BADGE LOGIC */}
                                                            {isAssignedToMe && showYouBadge && (
                                                                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold no-underline">
                                                                    You
                                                                </span>
                                                            )}
                                                            <ArrowUpRight className="size-4 ml-1 opacity-50 shrink-0" />
                                                        </Link>

                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            <Badge variant="outline" className={statusStyles[task.status]}>
                                                                {task.status}
                                                            </Badge>
                                                            {task.priority && (
                                                                <Badge className={priorityStyles[task.priority]}>
                                                                    {task.priority}
                                                                </Badge>
                                                            )}
                                                            {task.isArchived && <Badge variant="outline">Archived</Badge>}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-sm text-muted-foreground">
                                                    <div className="grid grid-cols-[70px_1fr] gap-x-2 gap-y-1">
                                                        <span>Due Date:</span>
                                                        <span>{task.dueDate ? format(new Date(task.dueDate), "EEE, MMM dd, yyyy") : "—"}</span>
                                                        <span>Project:</span>
                                                        <span className="truncate">{task.project.title}</span>
                                                        <span>Updated:</span>
                                                        <span>{format(new Date(task.updatedAt), "EEE, MMM dd, yyyy")}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {sortedTasks?.length === 0 && (
                                    <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                                        <CalendarIcon className="w-8 h-8 opacity-20" />
                                        <p>No tasks found for this criteria.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ======================= */}
                {/* BOARD VIEW              */}
                {/* ======================= */}
                <TabsContent value="board">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        {/* COLUMN: TO DO */}
                        <Card className="bg-muted/30">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center justify-between text-base">
                                    To Do
                                    <Badge variant={"secondary"} className="bg-background">{todoTasks?.length}</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 space-y-3 max-h-[600px] overflow-y-auto">
                                {todoTasks?.map((task) => {
                                    const isAssignedToMe = checkIsAssignedToMe(task);
                                    return (
                                        <Card key={task._id} className="hover:shadow-md transition-shadow border-muted">
                                            <Link to={`/workspaces/${task.project.workspace._id || task.project.workspace}/projects/${task.project._id}/tasks/${task._id}`} className="block">
                                                <div className="p-4 flex flex-col gap-2 justify-center">
                                                    <h3 className="font-medium leading-tight flex items-start justify-between gap-2">
                                                        <span className="line-clamp-2">{task.title}</span>
                                                        {isAssignedToMe && showYouBadge && (
                                                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold shrink-0">
                                                                You
                                                            </span>
                                                        )}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                        {task.description || "No description"}
                                                    </p>
                                                    <div className="flex items-center justify-between pt-2 mt-1 border-t border-border/50">
                                                        <Badge className={priorityStyles[task.priority]}>{task.priority}</Badge>
                                                        {task.dueDate && (
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {format(new Date(task.dueDate), "MMM dd")}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        </Card>
                                    );
                                })}
                            </CardContent>
                        </Card>

                        {/* COLUMN: IN PROGRESS */}
                        <Card className="bg-muted/30">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center justify-between text-base">
                                    In Progress
                                    <Badge variant={"secondary"} className="bg-background">{inProgressTasks?.length}</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 space-y-3 max-h-[600px] overflow-y-auto">
                                {inProgressTasks?.map((task) => {
                                    const isAssignedToMe = checkIsAssignedToMe(task);
                                    return (
                                        <Card key={task._id} className="hover:shadow-md transition-shadow border-blue-500/20">
                                            <Link to={`/workspaces/${task.project.workspace._id || task.project.workspace}/projects/${task.project._id}/tasks/${task._id}`} className="block">
                                                <div className="p-4 flex flex-col gap-2 justify-center">
                                                    <h3 className="font-medium leading-tight flex items-start justify-between gap-2">
                                                        <span className="line-clamp-2">{task.title}</span>
                                                        {isAssignedToMe && showYouBadge && (
                                                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold shrink-0">
                                                                You
                                                            </span>
                                                        )}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                        {task.description || "No description"}
                                                    </p>
                                                    <div className="flex items-center justify-between pt-2 mt-1 border-t border-border/50">
                                                        <Badge className={priorityStyles[task.priority]}>{task.priority}</Badge>
                                                        {task.dueDate && (
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {format(new Date(task.dueDate), "MMM dd")}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        </Card>
                                    );
                                })}
                            </CardContent>
                        </Card>

                        {/* COLUMN: DONE */}
                        <Card className="bg-muted/30">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center justify-between text-base">
                                    Done
                                    <Badge variant={"secondary"} className="bg-background">{doneTasks?.length}</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 space-y-3 max-h-[600px] overflow-y-auto">
                                {doneTasks?.map((task) => {
                                    const isAssignedToMe = checkIsAssignedToMe(task);
                                    return (
                                        <Card key={task._id} className="hover:shadow-md transition-shadow border-green-500/20 opacity-80 hover:opacity-100">
                                            <Link to={`/workspaces/${task.project.workspace._id || task.project.workspace}/projects/${task.project._id}/tasks/${task._id}`} className="block">
                                                <div className="p-4 flex flex-col gap-2 justify-center">
                                                    <h3 className="font-medium leading-tight flex items-start justify-between gap-2 line-through text-muted-foreground">
                                                        <span className="line-clamp-2">{task.title}</span>
                                                        {isAssignedToMe && showYouBadge && (
                                                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold shrink-0 no-underline">
                                                                You
                                                            </span>
                                                        )}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                        {task.description || "No description"}
                                                    </p>
                                                    <div className="flex items-center justify-between pt-2 mt-1 border-t border-border/50">
                                                        <Badge className={priorityStyles[task.priority]}>{task.priority}</Badge>
                                                        {task.dueDate && (
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <CheckCircle className="w-3 h-3 text-green-500" />
                                                                {format(new Date(task.dueDate), "MMM dd")}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        </Card>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default MyTasks;