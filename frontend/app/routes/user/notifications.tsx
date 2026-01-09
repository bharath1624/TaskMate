import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";


export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const navigate = useNavigate();
    const loadNotifications = async () => {
        const res = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api-v1/notifications`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }
        );
        const data = await res.json();
        setNotifications(data);
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const markAllAsRead = async () => {
        await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api-v1/notifications/read`,
            {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }
        );

        await loadNotifications(); // 🔥 backend is source of truth
    };

    const handleNotificationClick = async (n: any) => {
        // mark as read if unread
        if (!n.isRead) {
            await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api-v1/notifications/${n._id}/read`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            setNotifications(prev =>
                prev.map(item =>
                    item._id === n._id ? { ...item, isRead: true } : item
                )
            );
        }

        // navigate based on notification target
        if (n.targetType === "task") {
            navigate(
                `/workspaces/${n.workspaceId}/projects/${n.projectId}/tasks/${n.targetId}`
            );
        }

        if (n.targetType === "project") {
            navigate(
                `/workspaces/${n.workspaceId}/projects/${n.targetId}`
            );
        }
    };

    const deleteNotification = async (id: string) => {
        await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api-v1/notifications/${id}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }
        );

        // remove from UI immediately
        setNotifications(prev => prev.filter(n => n._id !== id));
    };

    return (
        <div className="max-w-3xl mx-auto py-6 space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">Notifications</h1>
                <Button size="sm" variant="outline" onClick={markAllAsRead}>
                    Mark all as read
                </Button>
            </div>

            {notifications.length === 0 ? (
                <p className="text-muted-foreground">No notifications</p>
            ) : (
                notifications.map((n) => (
                    <div
                        key={n._id}
                        onClick={() => handleNotificationClick(n)}
                        className={`
    p-4 rounded-md border
    flex justify-between gap-4
    cursor-pointer
    ${!n.isRead ? "bg-muted/50" : "bg-background"}
    hover:bg-muted/70 transition
  `}
                    >
                        {/* LEFT: content */}
                        <div className="space-y-1">
                            <p className="font-medium">{n.title}</p>
                            <p className="text-sm text-muted-foreground">{n.message}</p>
                        </div>

                        {/* RIGHT: meta actions */}
                        <div
                            className="flex flex-col items-end gap-2 shrink-0"
                            onClick={(e) => e.stopPropagation()} // prevent row click
                        >
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDistanceToNow(new Date(n.createdAt))} ago
                            </span>

                            <button
                                onClick={() => deleteNotification(n._id)}
                                className="text-xs text-destructive hover:underline"
                            >
                                Delete
                            </button>
                        </div>
                    </div>

                ))
            )}
        </div>
    );
}
