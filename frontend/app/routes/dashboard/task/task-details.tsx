import { Loader } from "@/components/loader";
import { CommentSection } from "@/components/task/comment-section";
import { SubTasksDetails } from "@/components/task/sub-tasks";
import { TaskActivity } from "@/components/task/task-activity";
import { TaskAssigneesSelector } from "@/components/task/task-assignees-selector";
import { TaskDescription } from "@/components/task/task-description";
import { TaskPrioritySelector } from "@/components/task/task-priority-selector";
import { TaskStatusSelector } from "@/components/task/task-status-selector";
import { TaskTitle } from "@/components/task/task-title";
import { Watchers } from "@/components/task/watchers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    useAchievedTaskMutation,
    useTaskByIdQuery,
    useWatchTaskMutation,
} from "@/hooks/use-task";
import { useAuth } from "@/provider/auth-context";
import type { Project, Task } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { useDeleteTaskMutation } from "@/hooks/use-task";
import { TaskAttachments } from "./task-attachement";
import { priorityStyles } from "@/lib/task-util";
import { useEffect } from "react";

const TaskDetails = () => {
    const { user } = useAuth();
    const { taskId, projectId, workspaceId } = useParams<{
        taskId: string;
        projectId: string;
        workspaceId: string;
    }>();
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const { data, isLoading } = useTaskByIdQuery(taskId!) as {
        data: {
            task: Task;
            project: Project;
            canEdit: boolean;
            workspaceOwner: string;
        };
        isLoading: boolean;
    };

    const { mutate: watchTask, isPending: isWatching } = useWatchTaskMutation();
    const { mutate: achievedTask, isPending: isAchieved } = useAchievedTaskMutation();
    const { mutate: deleteTask, isPending: isDeleting } = useDeleteTaskMutation();

    if (isLoading) return <div><Loader /></div>;

    if (!data) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-2xl font-bold">Task not found</div>
            </div>
        );
    }

    const { task, project, canEdit, workspaceOwner } = data;
    const isAdminOrOwner = canEdit;

    const currentUserId = user?._id?.toString();
    const ownerId = workspaceOwner?.toString();
    let currentUserRole = "member";
    if (currentUserId === ownerId) currentUserRole = "owner";
    else if (isAdminOrOwner) currentUserRole = "admin";

    const isUserWatching = task?.watchers?.some(
        (watcher) => watcher._id.toString() === user?._id.toString()
    );

    const handleWatchTask = () => {
        watchTask({ taskId: task._id }, {
            onSuccess: () => toast.success("Task watched"),
            onError: () => toast.error("Failed to watch task"),
        });
    };

    const handleAchievedTask = () => {
        achievedTask({ taskId: task._id }, {
            onSuccess: () => toast.success("Task achieved"),
            onError: () => toast.error("Failed to achieve task"),
        });
    };

    const executeDelete = () => {
        deleteTask({ taskId: task._id }, {
            onSuccess: () => {
                toast.success("Task permanently deleted");
                navigate(`/workspaces/${workspaceId}/projects/${projectId}`);
            },
            onError: () => toast.error("Delete failed"),
        });
    };

    return (
        <div className="container mx-auto p-0 py-4 md:px-4">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6">
                <div className="flex flex-col md:flex-row md:items-center">
                    <h1 className="text-xl md:text-2xl font-bold">{task.title}</h1>
                    {task.isArchived && <Badge className="ml-2" variant={"outline"}>Archived</Badge>}
                </div>

                <div className="flex space-x-2 mt-4 md:mt-0">
                    <Button variant={"outline"} size="sm" onClick={handleWatchTask} className="w-fit" disabled={isWatching}>
                        {isUserWatching ? <><EyeOff className="mr-2 size-4" /> Unwatch</> : <><Eye className="mr-2 size-4" /> Watch</>}
                    </Button>

                    {isAdminOrOwner && (
                        <Button variant="outline" size="sm" onClick={handleAchievedTask} className="w-fit" disabled={isAchieved}>
                            {task.isArchived ? "Unarchive" : "Archive"}
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">

                {/* Left Column (Master Height) */}
                <div className="lg:col-span-9 flex flex-col gap-6">
                    <div className="bg-card rounded-lg p-6 shadow-sm">
                        <div className="flex flex-col md:flex-row justify-between items-start mb-4">
                            <div>
                                <Badge className={`mb-2 capitalize ${priorityStyles[task.priority]}`}>
                                    Priority: {task.priority}
                                </Badge>
                                <TaskTitle title={task.title} taskId={task._id} canEdit={isAdminOrOwner} />
                                <div className="text-sm font-sm">
                                    Created : {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-4 md:mt-0">
                                <TaskStatusSelector status={task.status} taskId={task._id} canEdit={isAdminOrOwner} />
                                {isAdminOrOwner && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="sm" disabled={isDeleting} className="hidden md:block">
                                                {isDeleting ? "Deleting..." : "Delete Task"}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={executeDelete} className="bg-red-600 hover:bg-red-700">Confirm</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-sm font-medium">Description</h3>
                            <TaskDescription description={task.description || ""} taskId={task._id} canEdit={isAdminOrOwner} />
                        </div>

                        <div className="space-y-6">
                            {/* ✅ FILTERED ASSIGNEES: Exclude Owner */}
                            <TaskAssigneesSelector
                                task={task}
                                assignees={task.assignees}
                                projectMembers={(project.members as any).filter(
                                    (m: any) => m.user._id !== ownerId
                                )}
                                canEdit={isAdminOrOwner}
                            />

                            <h3 className="text-sm font-medium">Task Priority</h3>
                            <TaskPrioritySelector priority={task.priority} taskId={task._id} canEdit={isAdminOrOwner} />
                            <TaskAttachments task={task} workspaceOwnerId={ownerId} currentUserRole={currentUserRole} />
                            <SubTasksDetails subTasks={task.subtasks || []} taskId={task._id} canEdit={isAdminOrOwner} />
                        </div>
                    </div>

                    <CommentSection taskId={task._id} members={project.members as any} assignees={data.task.assignees} />
                </div>

                {/* Right Column (Slave Height) */}
                <div className="lg:col-span-3 relative min-h-[500px]">
                    <div className="flex flex-col gap-6 lg:absolute lg:inset-0 overflow-hidden">
                        <div className="shrink-0">
                            <Watchers watchers={task.watchers || []} />
                        </div>

                        <div className="flex-1 min-h-0">
                            <TaskActivity resourceId={task._id} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetails;