import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { Bell, Inbox, Mail, MailOpen, Trash2, CheckCheck } from "lucide-react";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [visibleCount, setVisibleCount] = useState(10); // ✅ Track how many to show
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

    // ✅ Reset visible count when changing filters
    useEffect(() => {
        setVisibleCount(10);
    }, [filter]);

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

    // 1. First, filter the notifications
    const filteredNotifications = notifications.filter((n) => {
        if (filter === "unread") return !n.isRead;
        if (filter === "read") return n.isRead;
        return true;
    });

    // ✅ 2. Then, slice the array to only show the visible count
    const displayedNotifications = filteredNotifications.slice(0, visibleCount);

    return (
        /* 🔥 BREAKOUT WRAPPER 🔥 
           Added -mt-6 sm:-mt-8 to pull the page UP and eat the gap caused by your parent Layout wrapper 
        */
        <div className="relative left-1/2 -translate-x-1/2 w-screen min-h-screen bg-background text-foreground px-4 sm:px-8 lg:px-12 pb-12 -mt-6 sm:-mt-8 pt-2">

            {/* Inner fluid container - taking up all available width */}
            <div className="w-full max-w-[1500px] flex flex-col mx-auto">

                {/* ================= HEADER SECTION (Pulled flush to top) ================= */}
                <div className="flex items-center gap-3 mb-6 w-full">
                    <div className="bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20 shrink-0">
                        <Bell className="size-6 text-blue-500" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                </div>

                {/* ================= MAIN LAYOUT GRID ================= */}
                <div className="flex flex-col md:flex-row gap-8 w-full items-start">

                    {/* LEFT SIDEBAR 
                        🔥 Added mt-[52px] on desktop to align exactly with the FIRST notification card, 
                        bypassing the "Mark all as read" button entirely! 
                    */}
                    <div className="w-full md:w-64 lg:w-72 shrink-0 space-y-2 sticky top-8 mt-2 md:mt-[52px]">
                        <button
                            onClick={() => setFilter("inbox")}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all duration-200 ${filter === "inbox"
                                ? "bg-blue-600/10 text-blue-600 font-semibold border border-blue-600/20"
                                : "hover:bg-muted text-muted-foreground font-medium border border-transparent"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Inbox className="size-4" />
                                Inbox
                            </div>
                            <span className="bg-background px-2 py-0.5 rounded-md text-xs border border-border/50">
                                {notifications.length}
                            </span>
                        </button>

                        <button
                            onClick={() => setFilter("unread")}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all duration-200 ${filter === "unread"
                                ? "bg-blue-600/10 text-blue-600 font-semibold border border-blue-600/20"
                                : "hover:bg-muted text-muted-foreground font-medium border border-transparent"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Mail className="size-4" />
                                Unread
                            </div>
                            {notifications.filter(n => !n.isRead).length > 0 && (
                                <span className="bg-blue-600 text-white px-2 py-0.5 rounded-md text-xs font-bold shadow-sm">
                                    {notifications.filter(n => !n.isRead).length}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => setFilter("read")}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all duration-200 ${filter === "read"
                                ? "bg-blue-600/10 text-blue-600 font-semibold border border-blue-600/20"
                                : "hover:bg-muted text-muted-foreground font-medium border border-transparent"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <MailOpen className="size-4" />
                                Read
                            </div>
                        </button>
                    </div>

                    {/* RIGHT CONTENT: NOTIFICATIONS LIST */}
                    <div className="flex-1 w-full flex flex-col min-w-0">

                        {/* ================= MARK ALL AS READ (Above list, height exactly 36px + 16px mb) ================= */}
                        <div className="flex justify-end mb-4 h-9">
                            <Button
                                variant="outline"
                                size="sm"
                                className="font-medium hover:bg-muted bg-background shadow-sm border-border/50 h-9"
                                onClick={markAllAsRead}
                                disabled={notifications.every(n => n.isRead)}
                            >
                                <CheckCheck className="mr-2 size-4" />
                                Mark all as read
                            </Button>
                        </div>

                        {displayedNotifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 bg-card/50 border border-border/50 rounded-2xl border-dashed w-full">
                                <div className="bg-muted p-4 rounded-full mb-4">
                                    <Bell className="size-8 text-muted-foreground/50" />
                                </div>
                                <p className="text-lg font-semibold text-foreground">No notifications found</p>
                                <p className="text-sm text-muted-foreground mt-1">You’re all caught up for now! 🎉</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {displayedNotifications.map((n) => (
                                    <div
                                        key={n._id}
                                        onClick={() => handleNotificationClick(n)}
                                        className={`
                                            group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4
                                            rounded-xl border p-4 sm:p-5 cursor-pointer transition-all duration-300 w-full
                                            ${!n.isRead
                                                ? "bg-blue-500/5 border-blue-500/30 shadow-[0_4px_20px_-4px_rgba(59,130,246,0.1)] hover:bg-blue-500/10"
                                                : "bg-card border-border/50 hover:bg-muted/50 hover:border-border"
                                            }
                                        `}
                                    >
                                        {/* Unread Indicator Dot */}
                                        {!n.isRead && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl" />
                                        )}

                                        {/* Main Content Area */}
                                        <div className="flex items-start gap-4 flex-1 min-w-0">
                                            {/* Icon Placeholder based on read status */}
                                            <div className={`mt-1 shrink-0 rounded-full p-2 ${!n.isRead ? 'bg-blue-500/20 text-blue-500' : 'bg-muted text-muted-foreground'}`}>
                                                {!n.isRead ? <Mail className="size-4" /> : <MailOpen className="size-4" />}
                                            </div>

                                            <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                                                <div className="flex items-center gap-2">
                                                    <p className={`font-semibold truncate ${!n.isRead ? 'text-foreground' : 'text-foreground/80'}`}>
                                                        {n.title}
                                                    </p>
                                                    {!n.isRead && (
                                                        <span className="flex h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                                    {n.message}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Right Side: Time and Actions */}
                                        <div
                                            className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-4 shrink-0 pl-12 sm:pl-0 border-t sm:border-t-0 border-border/50 pt-3 sm:pt-0 mt-2 sm:mt-0"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <span className="text-[13px] font-medium text-muted-foreground whitespace-nowrap">
                                                {formatDistanceToNow(new Date(n.createdAt))} ago
                                            </span>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteNotification(n._id);
                                                }}
                                                className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-red-500 hover:bg-red-500/10 px-2 py-1 rounded-md transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                                            >
                                                <Trash2 className="size-3.5" />
                                                <span>Delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* ✅ SHOW MORE BUTTON */}
                                {filteredNotifications.length > visibleCount && (
                                    <div className="flex justify-center pt-4 pb-8">
                                        <Button
                                            variant="secondary"
                                            onClick={() => setVisibleCount(prev => prev + 10)}
                                            className="w-full max-w-xs"
                                        >
                                            Load More
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}