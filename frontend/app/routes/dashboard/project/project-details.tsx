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
import { format } from "date-fns";
import { AlertCircle, Calendar, CheckCircle, Clock, Settings, Inbox } from "lucide-react";
import { useState, useEffect } from "react"; // ✅ Added useEffect
import { useNavigate, useParams } from "react-router";
import { useUpdateTaskStatusMutation } from "@/hooks/use-task";
import { useAuth } from "@/provider/auth-context";
import { useQueryClient } from "@tanstack/react-query"; // ✅ Import QueryClient
import { socket } from "@/lib/socket"; // ⚠️ Make sure you have this file!

const getImageUrl = (path: string | undefined | null) => {
    if (!path) return undefined;
    if (path.startsWith("http")) return path;
    const BASE = "http://localhost:5000";
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${BASE}${cleanPath}`;
};

const ProjectDetails = () => {
    const { projectId, workspaceId } = useParams<{
        projectId: string;
        workspaceId: string;
    }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const queryClient = useQueryClient(); // ✅ Initialize Client

    const [isCreateTask, setIsCreateTask] = useState(false);
    const [taskFilter, setTaskFilter] = useState<TaskStatus | "All">("All");

    const { data, isLoading } = UseProjectQuery(projectId!) as {
        data: {
            tasks: Task[];
            project: Project;
            workspaceMembers: any[];
            canEdit: boolean;
        };
        isLoading: boolean;
    };

    // ✅ REAL-TIME LISTENER
    // This makes the Owner/Member screen update automatically when Admin changes something
    useEffect(() => {
        if (!socket) return;

        // Join the project room (ensure backend supports this)
        socket.emit("join_project", projectId);

        const handleTaskUpdate = () => {
            // Refetch data when any task is changed
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

    const visibleTasks = isAdminOrOwner
        ? tasks
        : tasks.filter((task) =>
            task.assignees.some((assignee: any) => assignee._id === user?._id)
        );

    const projectProgress = getProjectProgress(visibleTasks);

    const handleTaskClick = (taskId: string) => {
        navigate(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`);
    };

    const getTasksByStatus = (status: TaskStatus) => {
        return visibleTasks.filter((task) => task.status === status);
    };

    return (
        <div className="space-y-8 pt-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl md:text-2xl font-bold">{project.title}</h1>
                    </div>
                    {project.description && (
                        <p className="text-sm text-gray-500">{project.description}</p>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex items-center gap-3 min-w-[220px]">
                        <div className="flex flex-col w-full">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-large text-muted-foreground">Progress</span>
                                <span className="text-xs font-semibold text-gray-700">{projectProgress}%</span>
                            </div>
                            <Progress value={projectProgress} className="h-2.5 rounded-full bg-muted" />
                        </div>
                    </div>

                    {isAdminOrOwner && (
                        <>
                            <Button onClick={() => setIsCreateTask(true)}>Add Task</Button>
                            <Button
                                variant="outline"
                                size="icon"
                                title="Project Settings"
                                onClick={() => navigate(`/workspaces/${workspaceId}/projects/${projectId}/settings`)}
                            >
                                <Settings className="size-4" />
                            </Button>
                        </>
                    )}
                </div>
            </div>

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
                            <div>
                                <Badge variant="outline" className="bg-background">{visibleTasks.filter((task) => task.status === "To Do").length} To Do</Badge>
                                <Badge variant="outline" className="bg-background">{visibleTasks.filter((task) => task.status === "In Progress").length} In Progress</Badge>
                                <Badge variant="outline" className="bg-background">{visibleTasks.filter((task) => task.status === "Done").length} Done</Badge>
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

// --- SUB COMPONENTS ---

interface TaskColumnProps { title: string; tasks: Task[]; onTaskClick: (taskId: string) => void; isFullWidth?: boolean; canEdit: boolean; }
const EmptyColumn = () => (<div className="flex flex-col items-center justify-center h-40 gap-2 rounded-lg border-2 border-dashed border-muted text-sm text-muted-foreground"><Inbox className="size-5 opacity-60" /> No tasks</div>);
const TaskColumn = ({ title, tasks, onTaskClick, isFullWidth = false, canEdit }: TaskColumnProps) => { return (<div className={isFullWidth ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : ""}> <div className={cn("space-y-4", !isFullWidth ? "h-full" : "col-span-full mb-4")}> {!isFullWidth && (<div className="flex items-center justify-between"> <h1 className="font-medium">{title}</h1> <Badge variant="outline">{tasks.length}</Badge> </div>)} <div className={cn("space-y-3", isFullWidth && "grid grid-cols-2 lg:grid-cols-3 gap-4")}> {tasks.length === 0 ? <EmptyColumn /> : tasks.map((task) => (<TaskCard key={task._id} task={task} onClick={() => onTaskClick(task._id)} canEdit={canEdit} />))} </div> </div> </div>); };

// ✅ UPDATED TASK CARD with Immediate Refresh Logic
const TaskCard = ({ task, onClick, canEdit }: { task: Task; onClick: () => void; canEdit: boolean }) => {
    const queryClient = useQueryClient();
    const { projectId } = useParams(); // Get projectId to invalidate the correct query

    const { mutate: updateTaskStatus, isPending } = useUpdateTaskStatusMutation();

    const getImageUrl = (path: string | undefined | null) => {
        if (!path) return "";
        if (path.startsWith("http")) return path;
        const BASE = "http://localhost:5000";
        const cleanPath = path.startsWith("/") ? path : `/${path}`;
        return `${BASE}${cleanPath}`;
    };

    // Helper function to handle status update with refresh
    const handleStatusUpdate = (e: React.MouseEvent, status: TaskStatus) => {
        e.stopPropagation();
        updateTaskStatus(
            { taskId: task._id, status },
            {
                onSuccess: () => {
                    // 🚀 IMMEDIATE REFRESH: This makes it show up for the Admin instantly
                    queryClient.invalidateQueries({ queryKey: ["project", projectId] });
                }
            }
        );
    };

    const assignees = task.assignees || [];
    const subtasks = task.subtasks || [];
    const completedSubtasks = subtasks.filter(t => t.completed).length;

    return (
        <Card onClick={onClick} className="cursor-pointer hover:shadow-md transition-all duration-300 hover:translate-y-1">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <Badge className={
                        task.priority === "High" ? "bg-red-500 text-white" :
                            task.priority === "Medium" ? "bg-orange-500 text-white" : "bg-slate-500 text-white"
                    }>
                        {task.priority}
                    </Badge>

                    <div className="flex gap-1">
                        {canEdit && task.status !== "To Do" && (
                            <Button variant="ghost" size="icon" className="size-6" title="Mark as To Do"
                                disabled={isPending}
                                onClick={(e) => handleStatusUpdate(e, "To Do")}
                            >
                                <AlertCircle className="size-4" />
                            </Button>
                        )}
                        {canEdit && task.status !== "In Progress" && (
                            <Button variant="ghost" size="icon" className="size-6" title="Mark as In Progress"
                                disabled={isPending}
                                onClick={(e) => handleStatusUpdate(e, "In Progress")}
                            >
                                <Clock className="size-4" />
                            </Button>
                        )}
                        {canEdit && task.status !== "Done" && (
                            <Button variant="ghost" size="icon" className="size-6" title="Mark as Done"
                                disabled={isPending}
                                onClick={(e) => handleStatusUpdate(e, "Done")}
                            >
                                <CheckCircle className="size-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <h4 className="font-medium mb-2">{task.title}</h4>
                {task.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{task.description}</p>}

                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        {assignees.slice(0, 5).map((member) => (
                            <Avatar key={member._id} className="relative size-8 bg-gray-700 rounded-full border-2 border-background overflow-hidden" title={member.name}>
                                <AvatarImage src={getImageUrl(member.profilePicture)} />
                                <AvatarFallback>{member.name?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                        ))}
                        {assignees.length > 5 && <span className="text-xs text-muted-foreground ml-2">+ {assignees.length - 5}</span>}
                    </div>
                    {task.dueDate && (
                        <div className="text-xs text-muted-foreground flex items-center">
                            <Calendar className="size-3 mr-1" />
                            {format(new Date(task.dueDate), "MMM d")}
                        </div>
                    )}
                </div>

                {subtasks.length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                        {completedSubtasks} / {subtasks.length} subtasks
                    </div>
                )}
            </CardContent>
        </Card>
    );
};