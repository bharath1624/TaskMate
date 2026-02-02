import { useAuth } from "@/provider/auth-context";
import type { Workspace } from "@/types";
import { Button } from "../ui/button";
import { IdCard, LogOut, PlusCircle, UserCircle } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuItem,
    DropdownMenuGroup,
} from "../ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Link, useLocation, useNavigate } from "react-router";
import { WorkspaceAvatar } from "../workspace/workspace-avatar";
import { NotificationBell } from "../notification-bell";
import { useState } from "react";

interface HeaderProps {
    workspaces?: Workspace[];
    onWorkspaceSelected: (workspace: Workspace) => void;
    selectedWorkspace: Workspace | null;
    onCreateWorkspace: () => void;
}

export const Header = ({
    workspaces = [],
    onWorkspaceSelected,
    selectedWorkspace,
    onCreateWorkspace,
}: HeaderProps) => {
    const navigate = useNavigate();
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const [open, setOpen] = useState(false);

    const { user, logout } = useAuth();

    const isOnWorkspacePage = useLocation().pathname.includes("/workspace");

    const handleOnClick = (workspace: Workspace) => {
        onWorkspaceSelected(workspace);
        navigate(`/dashboard?workspaceId=${workspace._id}`);
    };
    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    return (
        <div className="bg-background sticky top-0 z-40 border-b">
            <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant={"outline"}>
                            {selectedWorkspace ? (
                                <>
                                    {selectedWorkspace.color && (
                                        <WorkspaceAvatar
                                            color={selectedWorkspace.color}
                                            name={selectedWorkspace.name}
                                        />
                                    )}
                                    <span className="font-medium">{selectedWorkspace?.name}</span>
                                </>
                            ) : (
                                <span className="font-medium">Select Workspace</span>
                            )}
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent>
                        <DropdownMenuLabel>Workspace</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuGroup>
                            {workspaces.map((ws) => (
                                <DropdownMenuItem
                                    key={ws._id}
                                    onClick={() => handleOnClick(ws)}
                                >
                                    {ws.color && (
                                        <WorkspaceAvatar color={ws.color} name={ws.name} />
                                    )}
                                    <span className="ml-2">{ws.name}</span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuGroup>

                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={onCreateWorkspace}>
                                <PlusCircle className="w-4 h-4 mr-2" />
                                Create Workspace
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex items-center gap-4">

                    <div className="flex items-center gap-4">
                        {user && (
                            <div
                                className="
            relative flex items-center justify-center
            w-9 h-9 
            bg-background
            hover:bg-muted
            transition-all duration-200
            cursor-pointer
        "
                            >
                                <NotificationBell userId={user._id} />
                            </div>
                        )}

                    </div>

                    <DropdownMenu open={open} onOpenChange={setOpen}>
                        <DropdownMenuTrigger asChild>
                            <Avatar
                                className="w-8 h-8 cursor-pointer border transition-all duration-200 hover:shadow-sm"
                                onMouseEnter={() => setOpen(true)}
                            >
                                <AvatarImage
                                    src={
                                        user?.profilePicture?.startsWith("http")
                                            ? user.profilePicture
                                            : user?.profilePicture
                                                ? `${BACKEND_URL}${user.profilePicture}`
                                                : undefined
                                    }
                                />
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            sideOffset={8}
                            onMouseLeave={() => setOpen(false)}
                            className="
        w-35 rounded-lg border bg-background
        shadow-lg p-1
        animate-in fade-in zoom-in-95
    "
                        >
                            {/* NAME (not clickable) */}
                            <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground">
                                <IdCard className="w-4 h-4 text-muted-foreground" />
                                <span>{user?.name}</span>
                            </div>

                            <DropdownMenuSeparator className="my-1" />

                            {/* PROFILE */}
                            <DropdownMenuItem
                                asChild
                                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm cursor-pointer transition-colors hover:bg-muted focus:bg-muted"
                            >
                                <Link to="/user/profile">
                                    <UserCircle className="w-4 h-4 text-muted-foreground" />
                                    <span>Profile</span>
                                </Link>
                            </DropdownMenuItem>

                            {/* LOGOUT */}
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="
        flex items-center gap-2
        rounded-md px-3 py-2 text-sm
        cursor-pointer
        text-red-600
        transition-colors
        hover:bg-red-50 focus:bg-red-50
    "
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>

                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
};