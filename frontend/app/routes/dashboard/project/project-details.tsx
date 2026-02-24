import { Loader } from "@/components/loader";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UseProjectQuery } from "@/hooks/use-project";
import { getProjectProgress } from "@/lib";
import { cn } from "@/lib/utils";
import type { Project, Task, TaskStatus } from "@/types";
import {
    AlertCircle,
    CheckCircle,
    Settings,
    Inbox,
    PlayCircle,
    RotateCcw,
    LayoutList
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useUpdateTaskStatusMutation } from "@/hooks/use-task";
import { useAuth } from "@/provider/auth-context";
import { useQueryClient } from "@tanstack/react-query";
import { socket } from "@/lib/socket";
import { TaskDate } from "@/components/task/task-date"; // ✅ Import TaskDate

// --- HELPER ---
const getImageUrl = (path: string | undefined | null) => {
    if (!path) return undefined;
    if (path.startsWith("http")) return path;
    const BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${BASE}${cleanPath}`;
};

// --- MAIN COMPONENT ---
const ProjectDetails = () => {
    const { projectId, workspaceId } = useParams<{
        projectId: string;
        workspaceId: string;
    }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const [isCreateTask, setIsCreateTask] = useState(false);
    const [taskFilter, setTaskFilter] = useState<TaskStatus | "All">("All");
    const [showOverdueOnly, setShowOverdueOnly] = useState(false);
    const { data, isLoading } = UseProjectQuery(projectId!) as {
        data: {
            tasks: Task[];
            project: Project;
            workspaceMembers: any[];
            canEdit: boolean;
        };
        isLoading: boolean;
    };

    // ✅ Real-time Listener
    useEffect(() => {
        if (!socket || !projectId) return;

        socket.emit("join_project", projectId);

        const handleTaskUpdate = () => {
            queryClient.invalidateQueries({ queryKey: ["project", projectId] });
        };

        socket.on("task_updated", handleTaskUpdate);
        socket.on("task_created", handleTaskUpdate);
        socket.on("task_deleted", handleTaskUpdate);

        return () => {
            socket.off("task_updated", handleTaskUpdate);
            socket.off("task_created", handleTaskUpdate);
            socket.off("task_deleted", handleTaskUpdate);
            socket.emit("leave_project", projectId);
        };
    }, [projectId, queryClient]);

    if (isLoading) return <div><Loader /></div>;
    if (!data?.project) return <div>Project not found</div>;

    const { project, tasks, canEdit, workspaceMembers } = data;
    const isAdminOrOwner = canEdit;

    // Filter tasks based on permissions
    const visibleTasks = isAdminOrOwner
        ? tasks
        : tasks.filter((task) =>
            task.assignees.some((assignee: any) => assignee._id === user?._id)
        );

    const projectProgress = getProjectProgress(tasks);
    // ✅ 1. ADD THIS: Calculate overdue count for the button label
    const overdueTasksCount = visibleTasks.filter(t =>
        t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "Done"
    ).length;

    // ✅ 2. ADD THIS: The actual Filter Logic
    const filteredTasks = showOverdueOnly
        ? visibleTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "Done")
        : visibleTasks;

    const handleTaskClick = (taskId: string) => {
        navigate(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`);
    };

    const getTasksByStatus = (status: TaskStatus) => {
        return filteredTasks.filter((task) => task.status === status);
    };

    return (
        <div className="space-y-8 pt-5">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl md:text-2xl font-bold">{project.title}</h1>
                        {project.isArchived && <Badge variant="outline">Archived</Badge>}
                    </div>
                    {project.description && (
                        <p className="text-sm text-gray-500">{project.description}</p>
                    )}
                </div>

                <div className="flex flex-col gap-4 items-end">

                    {/* Row 1: Progress + Add Task + Settings */}
                    <div className="flex items-center gap-6">

                        {/* Progress */}
                        <div className="flex items-center gap-3 min-w-60">
                            <div className="flex flex-col w-full">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-muted-foreground">
                                        Progress
                                    </span>
                                    <span className="text-xs font-semibold text-gray-700">
                                        {projectProgress}%
                                    </span>
                                </div>
                                <Progress
                                    value={projectProgress}
                                    className="h-2.5 rounded-full bg-muted"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {isAdminOrOwner && !project.isArchived && (
                            <div className="flex items-center gap-3">
                                <Button onClick={() => setIsCreateTask(true)}>
                                    Add Task
                                </Button>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    title="Project Settings"
                                    onClick={() =>
                                        navigate(`/workspaces/${workspaceId}/projects/${projectId}/settings`)
                                    }
                                >
                                    <Settings className="size-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Row 2: Overdue Button */}
                    {isAdminOrOwner && !project.isArchived && overdueTasksCount > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            className={
                                showOverdueOnly
                                    ? "border-primary text-primary bg-primary/10 hover:bg-primary/20"
                                    : "border-destructive text-destructive hover:bg-destructive/10 animate-pulse"
                            }
                            onClick={() => setShowOverdueOnly(!showOverdueOnly)}
                        >
                            {showOverdueOnly ? (
                                <>
                                    <LayoutList className="size-4 mr-2" />
                                    Show All Tasks
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="size-4 mr-2" />
                                    {`${overdueTasksCount} Overdue`}
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>

            {/* TABS & BOARD */}
            <div className="flex items-center justify-between">
                <Tabs defaultValue="all" className="w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <TabsList>
                            <TabsTrigger value="all" onClick={() => setTaskFilter("All")}>All Tasks</TabsTrigger>
                            <TabsTrigger value="todo" onClick={() => setTaskFilter("To Do")}>To Do</TabsTrigger>
                            <TabsTrigger value="in-progress" onClick={() => setTaskFilter("In Progress")}>In Progress</TabsTrigger>
                            <TabsTrigger value="done" onClick={() => setTaskFilter("Done")}>Done</TabsTrigger>
                        </TabsList>

                        <div className="flex items-center text-sm">
                            <span className="text-muted-foreground">Status:</span>
                            <div className="flex gap-2 ml-2">
                                <Badge variant="outline" className="bg-background">{visibleTasks.filter((t) => t.status === "To Do").length} To Do</Badge>
                                <Badge variant="outline" className="bg-background">{visibleTasks.filter((t) => t.status === "In Progress").length} Active</Badge>
                                <Badge variant="outline" className="bg-background">{visibleTasks.filter((t) => t.status === "Done").length} Done</Badge>
                            </div>
                        </div>
                    </div>

                    <TabsContent value="all" className="m-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <TaskColumn title="To Do" tasks={getTasksByStatus("To Do")} onTaskClick={handleTaskClick} canEdit={isAdminOrOwner} />
                            <TaskColumn title="In Progress" tasks={getTasksByStatus("In Progress")} onTaskClick={handleTaskClick} canEdit={isAdminOrOwner} />
                            <TaskColumn title="Done" tasks={getTasksByStatus("Done")} onTaskClick={handleTaskClick} canEdit={isAdminOrOwner} />
                        </div>
                    </TabsContent>

                    <TabsContent value="todo" className="m-0">
                        <TaskColumn title="To Do" tasks={getTasksByStatus("To Do")} onTaskClick={handleTaskClick} isFullWidth canEdit={isAdminOrOwner} />
                    </TabsContent>

                    <TabsContent value="in-progress" className="m-0">
                        <TaskColumn title="In Progress" tasks={getTasksByStatus("In Progress")} onTaskClick={handleTaskClick} isFullWidth canEdit={isAdminOrOwner} />
                    </TabsContent>

                    <TabsContent value="done" className="m-0">
                        <TaskColumn title="Done" tasks={getTasksByStatus("Done")} onTaskClick={handleTaskClick} isFullWidth canEdit={isAdminOrOwner} />
                    </TabsContent>
                </Tabs>
            </div>

            <CreateTaskDialog
                open={isCreateTask}
                onOpenChange={setIsCreateTask}
                projectId={projectId!}
                projectMembers={project.members as any}
                workspaceMembers={workspaceMembers || []}
            />
        </div>
    );
};

export default ProjectDetails;

// --- TASK COLUMN COMPONENT ---
interface TaskColumnProps { title: string; tasks: Task[]; onTaskClick: (taskId: string) => void; isFullWidth?: boolean; canEdit: boolean; }

const EmptyColumn = () => (
    <div className="flex flex-col items-center justify-center h-40 gap-2 rounded-lg border-2 border-dashed border-muted text-sm text-muted-foreground">
        <Inbox className="size-5 opacity-60" /> No tasks
    </div>
);

const TaskColumn = ({ title, tasks, onTaskClick, isFullWidth = false, canEdit }: TaskColumnProps) => {
    return (
        <div className={isFullWidth ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : ""}>
            <div className={cn("space-y-4", !isFullWidth ? "h-full" : "col-span-full mb-4")}>
                {!isFullWidth && (
                    <div className="flex items-center justify-between">
                        <h1 className="font-medium">{title}</h1>
                        <Badge variant="outline">{tasks.length}</Badge>
                    </div>
                )}
                <div className={cn("space-y-3", isFullWidth && "grid grid-cols-2 lg:grid-cols-3 gap-4")}>
                    {tasks.length === 0 ? <EmptyColumn /> : tasks.map((task) => (
                        <TaskCard key={task._id} task={task} onClick={() => onTaskClick(task._id)} canEdit={canEdit} />
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- TASK CARD COMPONENT (WITH UPDATE LOGIC & HIGHLIGHT) ---
const TaskCard = ({ task, onClick, canEdit }: { task: Task; onClick: () => void; canEdit: boolean }) => {
    const queryClient = useQueryClient();
    const { projectId } = useParams();
    const { mutate: updateTaskStatus, isPending } = useUpdateTaskStatusMutation();

    const handleStatusUpdate = (e: React.MouseEvent, status: TaskStatus) => {
        e.stopPropagation();

        updateTaskStatus(
            { taskId: task._id, status },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ["project", projectId] });
                }
            }
        );
    };

    const assignees = task.assignees || [];
    const subtasks = task.subtasks || [];
    const completedSubtasks = subtasks.filter(t => t.completed).length;

    const showTodoBtn = task.status !== "To Do";
    const showProgressBtn = task.status !== "In Progress";
    const showDoneBtn = task.status !== "Done";

    return (
        <Card onClick={onClick} className="cursor-pointer hover:shadow-md transition-all duration-300 hover:translate-y-1 relative group">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <Badge className={
                        task.priority === "High" ? "bg-red-500 text-white hover:bg-red-600" :
                            task.priority === "Medium" ? "bg-orange-500 text-white hover:bg-orange-600" : "bg-slate-500 text-white hover:bg-slate-600"
                    }>
                        {task.priority}
                    </Badge>

                    {canEdit && !task.isArchived && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {showTodoBtn && (
                                <Button
                                    variant="ghost" size="icon" className="size-6 hover:bg-gray-200"
                                    title="Move to To Do"
                                    disabled={isPending}
                                    onClick={(e) => handleStatusUpdate(e, "To Do")}
                                >
                                    <RotateCcw className="size-3.5 text-gray-600" />
                                </Button>
                            )}
                            {showProgressBtn && (
                                <Button
                                    variant="ghost" size="icon" className="size-6 hover:bg-blue-100"
                                    title="Move to In Progress"
                                    disabled={isPending}
                                    onClick={(e) => handleStatusUpdate(e, "In Progress")}
                                >
                                    <PlayCircle className="size-3.5 text-blue-600" />
                                </Button>
                            )}
                            {showDoneBtn && (
                                <Button
                                    variant="ghost" size="icon" className="size-6 hover:bg-green-100"
                                    title="Move to Done"
                                    disabled={isPending}
                                    onClick={(e) => handleStatusUpdate(e, "Done")}
                                >
                                    <CheckCircle className="size-3.5 text-green-600" />
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <h4 className="font-medium mb-2">{task.title}</h4>
                {task.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{task.description}</p>}

                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        {assignees.slice(0, 3).map((member) => (
                            <Avatar key={member._id} className="relative size-8 bg-gray-700 rounded-full border-2 border-background overflow-hidden" title={member.name}>
                                <AvatarImage src={getImageUrl(member.profilePicture)} />
                                <AvatarFallback className="text-[9px]">{member.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                        ))}
                        {assignees.length > 3 && (
                            <div className="size-8 rounded-full bg-muted flex items-center justify-center text-[9px] border-2 border-background font-medium">
                                +{assignees.length - 3}
                            </div>
                        )}
                    </div>

                    {/* ✅ HIGHLIGHTED DUE DATE */}
                    {task.dueDate && (
                        <TaskDate date={task.dueDate} status={task.status} />
                    )}
                </div>

                {subtasks.length > 0 && (
                    <div className="mt-2 pt-2 border-t text-xs text-muted-foreground flex items-center gap-1">
                        <CheckCircle className="size-3" />
                        {completedSubtasks}/{subtasks.length} subtasks
                    </div>
                )}
            </CardContent>
        </Card>
    );
};