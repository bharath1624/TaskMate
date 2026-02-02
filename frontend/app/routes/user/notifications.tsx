import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { BackButton } from "@/components/back-button";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const navigate = useNavigate();
    type FilterType = "inbox" | "unread" | "read";

    const [filter, setFilter] = useState<FilterType>("inbox");

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

        await loadNotifications();
    };

    const handleNotificationClick = async (n: any) => {
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

        setNotifications(prev => prev.filter(n => n._id !== id));
    };

    const filteredNotifications = notifications.filter((n) => {
        if (filter === "unread") return !n.isRead;
        if (filter === "read") return n.isRead;
        return true;
    });

    return (
        <div className="relative left-1/2 -translate-x-1/2 w-screen py-8">
            <div className="mx-auto max-w-5xl px-6">
                {/* Header */}
                <div className="mb-4">
                    <BackButton />
                </div>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold">Notifications</h1>
                        <p className="text-sm text-muted-foreground">
                            Stay up to date with project and task activity
                        </p>
                    </div>

                    <Button size="sm" variant="outline" onClick={markAllAsRead}>
                        Mark all as read
                    </Button>
                </div>

                {/* Full-width layout */}
                <div className="grid grid-cols-[220px_1fr] gap-6">
                    {/* LEFT SIDEBAR */}
                    <div className="space-y-1">
                        {[
                            { key: "inbox", label: "Inbox" },
                            { key: "unread", label: "Unread" },
                            { key: "read", label: "Read" },
                        ].map((item) => (
                            <button
                                key={item.key}
                                onClick={() => setFilter(item.key as any)}
                                className={`w-full text-left px-3 py-2.5 rounded-md text-sm
                            transition
                            ${filter === item.key
                                        ? "bg-muted font-medium"
                                        : "hover:bg-muted/60 text-muted-foreground"}
                        `}
                            >
                                {item.label}
                                {item.key === "unread" && (
                                    <span className="ml-2 text-xs text-primary">
                                        ({notifications.filter(n => !n.isRead).length})
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* RIGHT CONTENT */}
                    <div className="space-y-3">
                        {filteredNotifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                                <p className="font-medium">No notifications</p>
                                <p className="text-sm">You’re all caught up 🎉</p>
                            </div>
                        ) : (
                            filteredNotifications.map((n) => (
                                <div
                                    key={n._id}
                                    onClick={() => handleNotificationClick(n)}
                                    className={`
                                relative flex justify-between gap-4
                               rounded-lg border px-5 py-4 cursor-pointer
                                transition hover:bg-muted/70
                                ${!n.isRead ? "bg-muted/50 border-primary/30" : "bg-background"}
                            `}
                                >
                                    {/* ✅ Dot Positioned */}
                                    {!n.isRead && (
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
                                    )}

                                    {/* ✅ Added padding-left (pl-6) to create space from the dot */}
                                    <div className="space-y-1 pl-6">
                                        <p className="font-medium">{n.title}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {n.message}
                                        </p>
                                    </div>

                                    {/* ✅ Right Side: Justify Between pushes Delete to bottom */}
                                    <div
                                        className="flex flex-col items-end justify-between gap-4 shrink-0 self-stretch"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(n.createdAt))} ago
                                        </span>

                                        <button
                                            onClick={() => deleteNotification(n._id)}
                                            className="text-xs text-muted-foreground hover:text-destructive hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}