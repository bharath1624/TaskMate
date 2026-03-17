import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
    useTimeLogsQuery,
    useStartTimerMutation,
    useStopTimerMutation,
    useDeleteTimeLogMutation,
    formatDuration,
} from "@/hooks/use-time-tracking";
import { useAuth } from "@/provider/auth-context";
import { toast } from "sonner";
import { Play, Square, Trash2, Clock, History } from "lucide-react";
import { format } from "date-fns";

interface Props {
    taskId: string;
    canEdit: boolean; // True if Admin
    isOwner?: boolean; // True if Workspace Owner
}

export const TaskTimeTracker = ({ taskId, canEdit, isOwner = false }: Props) => {
    const { user } = useAuth();
    const { data, isLoading } = useTimeLogsQuery(taskId);

    const { mutate: startTimer, isPending: isStarting } = useStartTimerMutation();
    const { mutate: stopTimer, isPending: isStopping } = useStopTimerMutation();
    const { mutate: deleteLog, isPending: isDeleting } = useDeleteTimeLogMutation();

    const [elapsed, setElapsed] = useState(0);
    const [stopNote, setStopNote] = useState("");

    const activeSession = data?.activeSession;

    // Safely checking ID whether it's populated or just a string
    const activeUserId = activeSession?.user?._id || activeSession?.user;
    const isMySession = activeUserId === user?._id?.toString();

    // Tick the elapsed timer every second
    useEffect(() => {
        if (!activeSession || !isMySession) {
            setElapsed(0);
            return;
        }
        const startMs = new Date(activeSession.startTime).getTime();
        const update = () => setElapsed(Math.floor((Date.now() - startMs) / 1000));
        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, [activeSession, isMySession]);

    const handleStart = () => {
        startTimer(taskId, {
            onSuccess: () => toast.success("Timer started! Let's get to work."),
            onError: () => toast.error("Failed to start timer"),
        });
    };

    const handleStop = () => {
        stopTimer(
            { taskId, note: stopNote },
            {
                onSuccess: () => {
                    toast.success("Timer stopped. Great job!");
                    setStopNote("");
                },
                onError: () => toast.error("Failed to stop timer"),
            }
        );
    };

    const handleDelete = (logId: string) => {
        deleteLog(
            { taskId, logId },
            {
                onSuccess: () => toast.success("Time log removed"),
                onError: () => toast.error("Failed to delete log"),
            }
        );
    };

    if (isLoading) return <div className="animate-pulse h-24 bg-muted/50 rounded-xl w-full"></div>;

    const totalSeconds = data?.totalSeconds ?? 0;
    const hasLogs = data && data.logs.length > 0;

    return (
        <div className="flex flex-col bg-background rounded-xl border border-border/60 shadow-sm overflow-hidden w-full">

            {/* Header */}
            <div className="bg-muted/20 px-4 py-3.5 border-b border-border/50 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold flex items-center gap-1.5 text-foreground/90 tracking-tight">
                    <Clock className="size-4 text-primary" />
                    Time Tracking
                </h3>
                <div className="flex items-center gap-1.5 bg-background border border-border/60 px-2.5 py-1 rounded-full shadow-sm">
                    <span className="text-[11px] text-muted-foreground font-medium whitespace-nowrap">Total:</span>
                    <span className="text-xs font-mono font-bold text-foreground whitespace-nowrap">
                        {formatDuration(totalSeconds)}
                    </span>
                </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-6">

                {/* Timer Controls (Hidden for Owners) */}
                {!isOwner && (
                    <div>
                        {isMySession ? (
                            <div className="relative rounded-xl bg-primary/5 border border-primary/20 p-4 transition-all shadow-inner">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary animate-pulse"></div>
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="relative flex h-2.5 w-2.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60"></span>
                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                                            </span>
                                            <span className="text-s font-medium text-primary">Recording...</span>
                                        </div>
                                        <div className="text-2xl font-mono font-bold tracking-widest text-primary drop-shadow-sm">
                                            {formatDuration(elapsed)}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <Input
                                            value={stopNote}
                                            onChange={(e) => setStopNote(e.target.value)}
                                            placeholder="What are you working on?"
                                            className="h-10 bg-background/60 border-primary/20 focus-visible:ring-primary/40 transition-shadow"
                                        />
                                        <Button
                                            onClick={handleStop}
                                            disabled={isStopping}
                                            className="h-10 px-5 bg-red-500 hover:bg-red-600 text-primary-foreground shadow-md transition-transform active:scale-95 group"
                                        >
                                            <Square className="size-4 mr-2 fill-current group-hover:scale-90 transition-transform" />
                                            Stop
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Button
                                onClick={handleStart}
                                disabled={isStarting}
                                className="w-full h-11 border-dashed border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary hover:text-primary transition-all duration-300 group rounded-xl"
                            >
                                <Play className="size-4 mr-2 group-hover:scale-110 transition-transform fill-primary/80" />
                                <span className="font-semibold text-sm">Start Timer</span>
                            </Button>
                        )}
                    </div>
                )}

                {/* Log History */}
                <div>
                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <History className="size-3" />
                        Activity Log
                    </h4>

                    {!hasLogs ? (
                        <div className="text-center py-6 px-4 bg-muted/20 border border-dashed border-border/60 rounded-xl">
                            <p className="text-[11px] text-muted-foreground">No activity yet</p>
                        </div>
                    ) : (
                        // ✅ HIDDEN SCROLLBAR TRICK APPLIED HERE
                        <div className="space-y-2 max-h-[250px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {data.logs.map((log) => {
                                const isLogOwner = log.user?._id === user?._id?.toString();
                                const canDelete = isLogOwner || canEdit;
                                const isRunning = log.endTime === null;

                                return (
                                    <div
                                        key={log._id}
                                        className="group flex items-start justify-between gap-2 p-2.5 rounded-lg hover:bg-accent/40 border border-transparent hover:border-border/50 transition-all duration-200"
                                    >
                                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                            <Avatar className="size-7 ring-1 ring-border/50 shadow-sm shrink-0 mt-0.5">
                                                <AvatarImage src={
                                                    log.user?.profilePicture
                                                        ? (log.user.profilePicture.startsWith('http')
                                                            ? log.user.profilePicture
                                                            : `http://localhost:5000${log.user.profilePicture}`)
                                                        : undefined
                                                } />
                                                <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-medium">
                                                    {log.user?.name?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>

                                            {/* ✅ RE-ARRANGED TEXT SO IT DOESN'T CLASH */}
                                            <div className="flex flex-col min-w-0 w-full">
                                                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                                                    <span className="text-xs font-semibold truncate text-foreground/90 max-w-[100px]">
                                                        {log.user?.name?.split(" ")[0]}
                                                    </span>
                                                    <span className="text-[9px] text-muted-foreground/60 whitespace-nowrap">
                                                        • {format(new Date(log.startTime), "MMM d, h:mm a")}
                                                    </span>
                                                </div>
                                                {log.note ? (
                                                    <span className="text-[10px] text-muted-foreground truncate w-full mt-0.5 block">
                                                        {log.note}
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-muted-foreground/40 italic mt-0.5 block">
                                                        No note
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <span className="font-mono text-[11px] font-semibold text-foreground/80 bg-background px-2 py-0.5 rounded border border-border/60 shadow-sm whitespace-nowrap">
                                                {isRunning ? (
                                                    <span className="text-primary animate-pulse">Running</span>
                                                ) : (
                                                    formatDuration(log.duration)
                                                )}
                                            </span>

                                            {canDelete && !isRunning && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(log._id)}
                                                    disabled={isDeleting}
                                                    className="size-6 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200 shrink-0"
                                                    title="Delete log"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};