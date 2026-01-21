import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { socket } from "@/lib/socket";

interface Notification {
    _id: string;
    isRead: boolean;
}

export const NotificationBell = ({ userId }: { userId: string }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const navigate = useNavigate();

    // unread count
    const unreadCount = notifications.filter(n => !n.isRead).length;

    // load notifications from backend
    useEffect(() => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api-v1/notifications`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        })
            .then(res => res.json())
            .then(data => setNotifications(Array.isArray(data) ? data : []))
            .catch(() => { });
    }, []);

    // socket connection
    useEffect(() => {
        if (!userId) return;

        const handleConnect = () => {
            socket.emit("join", String(userId));
        };

        const handleNotification = () => {
            // reload notifications to keep count accurate
            fetch(`${import.meta.env.VITE_BACKEND_URL}/api-v1/notifications`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
                .then(res => res.json())
                .then(data => setNotifications(Array.isArray(data) ? data : []))
        };

        socket.on("connect", handleConnect);
        socket.on("notification", handleNotification);

        if (socket.connected) handleConnect();

        return () => {
            socket.off("connect", handleConnect);
            socket.off("notification", handleNotification);
        };
    }, [userId]);

    return (
        <button
            onClick={() => navigate("/user/notifications")}
            className="relative"
        >
            <Bell className="w-5 h-5 text-muted-foreground hover:text-foreground" />

            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full px-1">
                    {unreadCount}
                </span>
            )}
        </button>
    );
};
