// frontend/app/hooks/use-time-tracking.ts  ← NEW FILE

import { deleteData, fetchData, postData } from "@/lib/fetch-util";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ── Types ────────────────────────────────────────────────────────
export interface TimeLog {
    _id: string;
    task: string;
    project: string;
    workspace: string;
    user: { _id: string; name: string; profilePicture?: string };
    startTime: string;
    endTime: string | null;
    duration: number; // seconds
    note: string;
    isManual: boolean;
    createdAt: string;
}

export interface TimeLogsResponse {
    logs: TimeLog[];
    activeSession: TimeLog | null;
    totalSeconds: number;
}

// ── Helpers ──────────────────────────────────────────────────────
export const formatDuration = (seconds: number): string => {
    if (!seconds || seconds < 0) return "0h 0m";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
};

export const secondsToHM = (seconds: number) => ({
    hours: Math.floor(seconds / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
});

// ── Queries / Mutations ──────────────────────────────────────────

export const useTimeLogsQuery = (taskId: string) =>
    useQuery<TimeLogsResponse>({
        queryKey: ["time-logs", taskId],
        queryFn: () => fetchData(`/tasks/${taskId}/time`),
        enabled: !!taskId,
        refetchInterval: (query) => {
            // Poll every 5s only when there's an active session
            return query.state.data?.activeSession ? 5000 : false;
        },
    });

export const useStartTimerMutation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (taskId: string) => postData(`/tasks/${taskId}/time/start`, {}),
        onSuccess: (_data, taskId) => {
            qc.invalidateQueries({ queryKey: ["time-logs", taskId] });
            qc.invalidateQueries({ queryKey: ["task", taskId] });
        },
    });
};

export const useStopTimerMutation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ taskId, note }: { taskId: string; note?: string }) =>
            postData(`/tasks/${taskId}/time/stop`, { note }),
        onSuccess: (_data, { taskId }) => {
            qc.invalidateQueries({ queryKey: ["time-logs", taskId] });
            qc.invalidateQueries({ queryKey: ["task", taskId] });
        },
    });
};

export const useAddManualTimeMutation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({
            taskId,
            duration,
            note,
            date,
        }: {
            taskId: string;
            duration: number; // seconds
            note?: string;
            date?: string;
        }) => postData(`/tasks/${taskId}/time/manual`, { duration, note, date }),
        onSuccess: (_data, { taskId }) => {
            qc.invalidateQueries({ queryKey: ["time-logs", taskId] });
            qc.invalidateQueries({ queryKey: ["task", taskId] });
        },
    });
};

export const useDeleteTimeLogMutation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ taskId, logId }: { taskId: string; logId: string }) =>
            deleteData(`/tasks/${taskId}/time/${logId}`),
        onSuccess: (_data, { taskId }) => {
            qc.invalidateQueries({ queryKey: ["time-logs", taskId] });
            qc.invalidateQueries({ queryKey: ["task", taskId] });
        },
    });
};
