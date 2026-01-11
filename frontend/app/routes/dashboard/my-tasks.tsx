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
import type { Task } from "@/types";
import { format } from "date-fns";
import { ArrowUpRight, CheckCircle, Clock, FilterIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";

const MyTasks = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const initialFilter = searchParams.get("filter") || "all";
    const initialSort = searchParams.get("sort") || "desc";
    const initialSearch = searchParams.get("search") || "";

    const [filter, setFilter] = useState<string>(initialFilter);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
        initialSort === "asc" ? "asc" : "desc"
    );
    const [search, setSearch] = useState<string>(initialSearch);

    useEffect(() => {
        const params: Record<string, string> = {};

        searchParams.forEach((value, key) => {
            params[key] = value;
        });

        params.filter = filter;
        params.sort = sortDirection;
        params.search = search;

        setSearchParams(params, { replace: true });
    }, [filter, sortDirection, search]);

    useEffect(() => {
        const urlFilter = searchParams.get("filter") || "all";
        const urlSort = searchParams.get("sort") || "desc";
        const urlSearch = searchParams.get("search") || "";

        if (urlFilter !== filter) setFilter(urlFilter);
        if (urlSort !== sortDirection)
            setSortDirection(urlSort === "asc" ? "asc" : "desc");
        if (urlSearch !== search) setSearch(urlSearch);
    }, [searchParams]);

    const { data: myTasks, isLoading } = useGetMyTasksQuery() as {
        data: Task[];
        isLoading: boolean;
    };

    const filteredTasks =
        myTasks?.length > 0
            ? myTasks
                .filter((task) => {
                    if (filter === "all") return true;
                    if (filter === "todo") return task.status === "To Do";
                    if (filter === "inprogress") return task.status === "In Progress";
                    if (filter === "done") return task.status === "Done";
                    if (filter === "achieved") return task.isArchived === true;
                    if (filter === "high") return task.priority === "High";

                    return true;
                })
                .filter(
                    (task) =>
                        task.title.toLowerCase().includes(search.toLowerCase()) ||
                        task.description?.toLowerCase().includes(search.toLowerCase())
                )
            : [];

    //   sort task
    const sortedTasks = [...filteredTasks].sort((a, b) => {
        if (a.dueDate && b.dueDate) {
            return sortDirection === "asc"
                ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
                : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        }
        return 0;
    });

    const todoTasks = sortedTasks.filter((task) => task.status === "To Do");
    const inProgressTasks = sortedTasks.filter(
        (task) => task.status === "In Progress"
    );
    const doneTasks = sortedTasks.filter((task) => task.status === "Done");

    if (isLoading)
        return (
            <div>
                <Loader />
            </div>
        );
    return (
        <div className="space-y-6 pt-5">
            <div className="flex items-start md:items-center justify-between">
                <h1 className="text-2xl font-bold">My Tasks</h1>

                <div
                    className="flex flex-col items-start md:flex-row md"
                    itemScope
                    gap-2
                >
                    <Button
                        variant={"outline"}
                        onClick={() =>
                            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                        }
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
                            <DropdownMenuLabel>Filter Tasks</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setFilter("all")}>
                                All Tasks
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilter("todo")}>
                                To Do
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilter("inprogress")}>
                                In Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilter("done")}>
                                Done
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilter("achieved")}>
                                Achieved
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilter("high")}>
                                High
                            </DropdownMenuItem>
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

            <Tabs defaultValue="list">
                <TabsList>
                    <TabsTrigger value="list">List View</TabsTrigger>
                    <TabsTrigger value="board">Board View</TabsTrigger>
                </TabsList>

                {/* LIST VIEW */}
                <TabsContent value="list">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Tasks</CardTitle>
                            <CardDescription>
                                {sortedTasks?.length} tasks assigned to you
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className="divide-y">
                                {sortedTasks?.map((task) => (
                                    <div key={task._id} className="p-4 hover:bg-muted/50">
                                        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 items-start">

                                            {/* LEFT COLUMN */}
                                            <div className="flex gap-3">
                                                {task.status === "Done" ? (
                                                    <CheckCircle className="size-4 text-green-500 mt-1" />
                                                ) : (
                                                    <Clock className="size-4 text-yellow-500 mt-1" />
                                                )}

                                                <div>
                                                    <Link
                                                        to={`/workspaces/${task.project.workspace}/projects/${task.project._id}/tasks/${task._id}`}
                                                        className="font-medium hover:text-primary hover:underline flex items-center"
                                                    >
                                                        {task.title}
                                                        <ArrowUpRight className="size-4 ml-1" />
                                                    </Link>

                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        <Badge
                                                            variant="outline"
                                                            className={statusStyles[task.status]}
                                                        >
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

                                            {/* RIGHT SIDE */}
                                            <div className="text-sm text-muted-foreground">
                                                <div className="grid grid-cols-[70px_1fr] gap-x-2 gap-y-1">
                                                    <span>Due Date :</span>
                                                    <span>{task.dueDate ? format(task.dueDate, "EEE, MMM dd, yyyy") : "—"}</span>

                                                    <span>Project :</span>
                                                    <span>{task.project.title}</span>

                                                    <span>Updated :</span>
                                                    <span>{format(task.updatedAt, "EEE, MMM dd, yyyy")}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {sortedTasks?.length === 0 && (
                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                        No tasks found
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* BOARD VIEW */}
                <TabsContent value="board">
                    <div className="grid grid-cols-1 md:grid-cols-3  gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    To Do
                                    <Badge variant={"outline"}>{todoTasks?.length}</Badge>
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="p-3 space-y-3 max-h-[600px] overflow-y-auto">
                                {todoTasks?.map((task) => (
                                    <Card
                                        key={task._id}
                                        className="hover:shadow-md transition-shadow"
                                    >
                                        <Link
                                            to={`/workspaces/${task.project.workspace}/projects/${task.project._id}/tasks/${task._id}`}
                                            className="block"
                                        >
                                            <div className="p-4 flex flex-col gap-2 justify-center">
                                                {/* TITLE */}
                                                <h3 className="font-medium leading-tight">
                                                    {task.title}
                                                </h3>

                                                {/* DESCRIPTION */}
                                                <p className="text-sm text-muted-foreground wrap-break-words line-clamp-3">
                                                    {task.description || "No description"}
                                                </p>

                                                {/* FOOTER */}
                                                <div className="flex items-center gap-2 pt-1">
                                                    <Badge className={priorityStyles[task.priority]}>
                                                        {task.priority}
                                                    </Badge>
                                                    {task.dueDate && (
                                                        <span className="text-xs text-muted-foreground">
                                                            Due Date: {format(task.dueDate, "MMM dd, yyyy")}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    </Card>
                                ))}

                                {todoTasks?.length === 0 && (
                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                        No tasks found
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    In Progress
                                    <Badge variant={"outline"}>{inProgressTasks?.length}</Badge>
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="p-3 space-y-3 max-h-[600px] overflow-y-auto">
                                {inProgressTasks?.map((task) => (
                                    <Card
                                        key={task._id}
                                        className="hover:shadow-md transition-shadow"
                                    >
                                        <Link
                                            to={`/workspaces/${task.project.workspace}/projects/${task.project._id}/tasks/${task._id}`}
                                            className="block"
                                        >
                                            <div className="p-4 flex flex-col gap-2 justify-center">
                                                {/* TITLE */}
                                                <h3 className="font-medium leading-tight">
                                                    {task.title}
                                                </h3>

                                                {/* DESCRIPTION */}
                                                <p className="text-sm text-muted-foreground wrap-break-words line-clamp-3">
                                                    {task.description || "No description"}
                                                </p>

                                                {/* FOOTER */}
                                                <div className="flex items-center gap-2 pt-1">
                                                    <Badge className={priorityStyles[task.priority]}>
                                                        {task.priority}
                                                    </Badge>
                                                    {task.dueDate && (
                                                        <span className="text-xs text-muted-foreground">
                                                            Due Date: {format(task.dueDate, "MMM dd, yyyy")}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    </Card>
                                ))}

                                {inProgressTasks?.length === 0 && (
                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                        No tasks found
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    Done
                                    <Badge variant={"outline"}>{doneTasks?.length}</Badge>
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="p-3 space-y-3 max-h-[600px] overflow-y-auto">
                                {doneTasks?.map((task) => (
                                    <Card
                                        key={task._id}
                                        className="hover:shadow-md transition-shadow"
                                    >
                                        <Link
                                            to={`/workspaces/${task.project.workspace}/projects/${task.project._id}/tasks/${task._id}`}
                                            className="block"
                                        >
                                            <div className="p-4 flex flex-col gap-2 justify-center">
                                                {/* TITLE */}
                                                <h3 className="font-medium leading-tight">
                                                    {task.title}
                                                </h3>

                                                {/* DESCRIPTION */}
                                                <p className="text-sm text-muted-foregroundwrap-break-words line-clamp-3">
                                                    {task.description || "No description"}
                                                </p>

                                                {/* FOOTER */}
                                                <div className="flex items-center gap-2 pt-1">
                                                    <Badge className={priorityStyles[task.priority]}>
                                                        {task.priority}
                                                    </Badge>
                                                    {task.dueDate && (
                                                        <span className="text-xs text-muted-foreground">
                                                            Due Date: {format(task.dueDate, "MMM dd, yyyy")}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    </Card>
                                ))}

                                {doneTasks?.length === 0 && (
                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                        No tasks found
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default MyTasks;