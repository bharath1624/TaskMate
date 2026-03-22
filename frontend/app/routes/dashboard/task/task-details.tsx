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
import {
    Eye, EyeOff, Archive, ArchiveRestore, Trash2, Calendar,
    LayoutList, Paperclip, MessageSquare, Activity,
    Users, CircleDot, Flag, Clock
} from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { useDeleteTaskMutation } from "@/hooks/use-task";
import { TaskAttachments } from "./task-attachement";
import { priorityStyles } from "@/lib/task-util";
import { useEffect } from "react";
import { TaskTimeTracker } from "@/components/task/task-timer-tracker";

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

    if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader /></div>;

    if (!data) {
        return (
            <div className="flex items-center justify-center h-screen bg-background text-foreground">
                <div className="text-2xl font-bold text-muted-foreground">Task not found</div>
            </div>
        );
    }

    const { task, project, canEdit, workspaceOwner } = data;
    const isAdminOrOwner = canEdit;

    const currentUserId = user?._id?.toString();
    const isUserWatching = task?.watchers?.some(
        (watcher) => watcher._id.toString() === user?._id.toString()
    );
    const ownerId = typeof workspaceOwner === "object"
        ? (workspaceOwner as any)._id?.toString()
        : workspaceOwner?.toString();

    let currentUserRole = "member";
    if (currentUserId === ownerId) currentUserRole = "owner";
    else if (isAdminOrOwner) currentUserRole = "admin";
    const isOwner = currentUserId === ownerId;

    // ✅ FIX: Dynamic Watch/Unwatch Toast Messages
    const handleWatchTask = () => {
        watchTask({ taskId: task._id }, {
            onSuccess: () => toast.success(isUserWatching ? "Task unwatched" : "Task watched"),
            onError: () => toast.error(isUserWatching ? "Failed to unwatch task" : "Failed to watch task"),
        });
    };

    // ✅ FIX: Dynamic Archive/Unarchive Toast Messages
    const handleAchievedTask = () => {
        achievedTask({ taskId: task._id }, {
            onSuccess: () => toast.success(task.isArchived ? "Task unarchived" : "Task archived"),
            onError: () => toast.error(task.isArchived ? "Failed to unarchive task" : "Failed to archive task"),
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
        <div className="min-h-screen bg-background text-foreground pb-12">

            {/* ================= STICKY TOP BAR (ACTIONS) ================= */}
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/40 px-4 sm:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="uppercase text-[10px] tracking-wider font-bold rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border-none px-2 py-1">
                        Task
                    </Badge>
                    <Badge className={`capitalize shadow-none border-none px-2 py-1 ${priorityStyles[task.priority]}`}>
                        {task.priority}
                    </Badge>
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="size-3.5" />
                        Created {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                    </span>
                    {task.isArchived && (
                        <Badge variant="destructive" className="uppercase text-[10px] tracking-wider font-semibold rounded-md">
                            Archived
                        </Badge>
                    )}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                    {currentUserRole !== "member" && (
                        <Button variant="outline" size="sm" onClick={handleWatchTask} disabled={isWatching} className="h-8 shadow-sm border-border/50">
                            {isUserWatching ? <><EyeOff className="mr-2 size-3.5" /> Unwatch</> : <><Eye className="mr-2 size-3.5" /> Watch</>}
                        </Button>
                    )}

                    {isAdminOrOwner && (
                        <>
                            <Button variant="outline" size="sm" onClick={handleAchievedTask} disabled={isAchieved} className="h-8 shadow-sm border-border/50">
                                {task.isArchived ? <><ArchiveRestore className="mr-2 size-3.5" /> Unarchive</> : <><Archive className="mr-2 size-3.5" /> Archive</>}
                            </Button>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm" disabled={isDeleting} className="h-8 shadow-sm">
                                        <Trash2 className="mr-2 size-3.5" />
                                        {isDeleting ? "Deleting..." : "Delete"}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-2xl">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete this task?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the task and remove all associated data, comments, and attachments.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={executeDelete} className="bg-red-600 hover:bg-red-700 text-white rounded-xl">
                                            Confirm Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </>
                    )}
                </div>
            </header>

            {/* ================= MAIN CONTENT LAYOUT ================= */}
            <div className="max-w-[1500px] mx-auto w-full px-4 sm:px-8 pt-6 sm:pt-8 flex flex-col lg:flex-row gap-8 items-start">

                {/* ⬅️ LEFT COLUMN: MAIN TASK CONTENT */}
                <div className="flex-1 w-full flex flex-col gap-6 min-w-0">

                    {/* Header & Properties Card */}
                    <div className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-sm">
                        <div className="mb-6">
                            <TaskTitle title={task.title} taskId={task._id} canEdit={isAdminOrOwner} />
                        </div>

                        {/* Properties Grid (Inline SaaS Style) */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-border/40">
                            {/* Status */}
                            <div className="flex flex-col gap-2.5">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <CircleDot className="size-3.5" /> Status
                                </span>
                                <div>
                                    <TaskStatusSelector status={task.status} taskId={task._id} canEdit={isAdminOrOwner} />
                                </div>
                            </div>

                            {/* Priority */}
                            <div className="flex flex-col gap-2.5">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <Flag className="size-3.5" /> Priority
                                </span>
                                <div className="flex items-center gap-2">
                                    <TaskPrioritySelector priority={task.priority} taskId={task._id} canEdit={isAdminOrOwner} />
                                </div>
                            </div>

                            {/* Assignees */}
                            <div className="flex flex-col gap-2.5">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <Users className="size-3.5" /> Assignees
                                </span>
                                <div>
                                    <TaskAssigneesSelector
                                        task={task}
                                        assignees={task.assignees}
                                        projectMembers={(project.members as any).filter(
                                            (m: any) => m.user._id !== ownerId
                                        )}
                                        canEdit={isAdminOrOwner}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description Card */}
                    <div className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-sm">
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-5 flex items-center gap-2">
                            <LayoutList className="size-4" /> Description
                        </h3>
                        <div className="prose dark:prose-invert max-w-none">
                            <TaskDescription description={task.description || ""} taskId={task._id} canEdit={isAdminOrOwner} />
                        </div>
                    </div>

                    {/* Attachments Card */}
                    <div className="bg-card border border-border/50 rounded-3xl p-4 sm:p-5 shadow-sm">
                        <TaskAttachments task={task} workspaceOwnerId={ownerId} currentUserRole={currentUserRole} members={project.members} />
                    </div>

                    {/* Subtasks Card */}
                    <div className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-sm">
                        <SubTasksDetails subTasks={task.subtasks || []} taskId={task._id} canEdit={isAdminOrOwner} />
                    </div>

                    {/* Comments Card */}
                    <div className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-sm">
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
                            <MessageSquare className="size-4" /> Discussion
                        </h3>
                        <CommentSection taskId={task._id} members={project.members as any} assignees={data.task.assignees} />
                    </div>
                </div>

                {/* ➡️ RIGHT COLUMN: CONTEXT SIDEBAR */}
                <div className="w-full lg:w-[350px] shrink-0 flex flex-col gap-6 lg:sticky lg:top-24">

                    {/* Watchers Card */}
                    <div className="bg-card border border-border/50 rounded-[1.25rem] p-5 shadow-sm">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
                            <Eye className="size-3.5" /> Watchers
                        </h3>
                        <Watchers watchers={task.watchers || []} />
                    </div>

                    {/* Time Tracker Card */}
                    <div className="bg-card border border-border/50 rounded-[1.25rem] p-5 shadow-sm">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
                            <Clock className="size-3.5" /> Time Tracking
                        </h3>
                        <TaskTimeTracker
                            taskId={task._id}
                            canEdit={canEdit}
                            isOwner={isOwner}
                        />
                    </div>

                    {/* Activity Feed Card */}
                    <div className="bg-card border border-border/50 rounded-[1.25rem] p-5 shadow-sm flex flex-col max-h-[600px]">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border/40 pb-3 mb-4 flex items-center gap-1.5 shrink-0">
                            <Activity className="size-3.5" /> Activity Log
                        </h3>
                        <TaskActivity resourceId={task._id} />
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TaskDetails;