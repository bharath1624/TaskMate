import { useAuth } from "@/provider/auth-context";
import type { Workspace } from "@/types";
import {
    CheckCircle2,
    ChevronsLeft,
    ChevronsRight,
    Layers,
    LayoutDashboard,
    ListCheck,
    Settings,
    Users,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";
import { SidebarNav } from "./sidebar-nav";

export const SidebarComponent = ({
    currentWorkspace,
}: {
    currentWorkspace: Workspace | null;
}) => {
    const { user } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // ✅ FIX: Robust Role Detection
    // We convert both IDs to strings to ensure they match correctly.
    const userId = user?._id?.toString();

    const currentMember = currentWorkspace?.members?.find((m: any) => {
        // Handle cases where m.user is populated (Object) or just an ID (String)
        const memberId = m.user?._id ? m.user._id.toString() : m.user?.toString();
        return memberId === userId;
    });

    const userRole = currentMember?.role || "member";

    // Debugging: Uncomment if issues persist to see what role is being detected
    // console.log("Detected Role:", userRole);

    const navItems = [
        {
            title: "Dashboard",
            href: "/dashboard",
            icon: LayoutDashboard,
            allowedRoles: ["owner", "admin", "member"],
        },
        {
            title: "Workspaces",
            href: "/workspaces",
            icon: Users,
            allowedRoles: ["owner", "admin", "member"],
        },
        {
            title: "My Tasks",
            href: "/my-tasks",
            icon: ListCheck,
            allowedRoles: ["owner", "admin", "member"],
        },
        {
            title: "Members",
            href: `/members`,
            icon: Users,
            allowedRoles: ["owner", "admin", "member"],
        },
        {
            title: "Archived",
            href: `/achieved`,
            icon: CheckCircle2,
            allowedRoles: ["owner", "admin"], // ✅ Owner & Admin Only
        },
        {
            title: "Settings",
            href: currentWorkspace
                ? `/workspaces/${currentWorkspace._id}/settings`
                : "/workspaces",
            icon: Settings,
            allowedRoles: ["owner"], // ✅ Owner Only
        },
    ];

    // Filter Items based on Role
    const visibleItems = navItems.filter((item) =>
        item.allowedRoles.includes(userRole)
    );

    return (
        <div
            className={cn(
                "flex flex-col border-r bg-sidebar transition-all duration-300",
                isCollapsed ? "w-16 md:w-20" : "w-16 md:w-60"
            )}
        >
            <div className="flex h-14 items-center border-b px-4 mb-4">
                <Link to="/dashboard" className="flex items-center">
                    {!isCollapsed && (
                        <div className="flex items-center gap-2">
                            <Layers className="size-6 text-blue-600" />
                            <span className="font-semibold text-xl hidden md:block">
                                TaskMate
                            </span>
                        </div>
                    )}

                    {isCollapsed && <Layers className="size-6 text-blue-600" />}
                </Link>

                <Button
                    variant={"ghost"}
                    size="icon"
                    className="ml-auto hidden md:block"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? (
                        <ChevronsRight className="size-4" />
                    ) : (
                        <ChevronsLeft className="size-4" />
                    )}
                </Button>
            </div>
            <ScrollArea className="flex-1 px-3 py-2">
                <SidebarNav
                    items={visibleItems}
                    isCollapsed={isCollapsed}
                    className={cn(isCollapsed && "items-center space-y-2")}
                    currentWorkspace={currentWorkspace}
                />
            </ScrollArea>
        </div>
    );
};