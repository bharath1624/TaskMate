import { Bell } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { socket } from "@/lib/socket";
import { useQueryClient } from "@tanstack/react-query";
import { useGetNotificationsQuery } from "@/hooks/use-notification";

export const NotificationBell = ({ userId }: { userId: string }) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // 1. GLOBAL STATE: Automatically syncs with the Notifications Page
    const { data: notifications = [] } = useGetNotificationsQuery();

    // Calculate unread count
    const unreadCount = Array.isArray(notifications)
        ? notifications.filter((n) => !n.isRead).length
        : 0;

    // 2. SOCKET CONNECTION
    useEffect(() => {
        if (!userId) return;

        const handleConnect = () => {
            // Ensure ID is string
            socket.emit("join", String(userId));
        };

        const handleRefresh = () => {
            // Instead of fetching manually, tell React Query to refresh.
            // This updates the Bell AND the Notifications Page simultaneously.
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        };

        // Connect listeners
        socket.on("connect", handleConnect);
        socket.on("notification", handleRefresh); // New notification

        // Ensure we join if already connected
        if (socket.connected) handleConnect();

        return () => {
            socket.off("connect", handleConnect);
            socket.off("notification", handleRefresh);
        };
    }, [userId, queryClient]);

    return (
        <button
            onClick={() => navigate("/user/notifications")}
            className="relative p-2 rounded-full hover:bg-muted/50 transition-colors"
        >
            <Bell className="w-5 h-5 text-muted-foreground hover:text-foreground" />

            {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-[3px] text-[10px] font-bold text-white ring-2 ring-background">
                    {unreadCount > 9 ? "9+" : unreadCount}
                </span>
            )}
        </button>
    );
};