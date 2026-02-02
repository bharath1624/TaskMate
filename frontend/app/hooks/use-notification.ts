import { fetchData } from "@/lib/fetch-util";
import { useQuery } from "@tanstack/react-query";

export interface Notification {
    _id: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    type?: "project" | "workspace" | "task";
    targetId?: string;
    workspaceId?: string;
}

export const useGetNotificationsQuery = () => {
    return useQuery<Notification[]>({
        queryKey: ["notifications"],
        queryFn: () => fetchData<Notification[]>("/notifications"),
        // Optional: Polling every minute as a backup to sockets
        refetchInterval: 60000,
    });
};