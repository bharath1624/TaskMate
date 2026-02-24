import { useAuth } from "@/provider/auth-context";
import type { Workspace, Project } from "@/types";
import { Button } from "../ui/button";
import { LogOut, Moon, PlusCircle, Sun, UserCircle, Calendar as CalendarIcon, CalendarDays } from "lucide-react";
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
import { useState, useRef, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { format, isToday } from "date-fns";
// ✅ HOOK IMPORTS
import { useGetMyTasksQuery, useGetWorkspaceTasksQuery } from "@/hooks/use-task";
import { useGetWorkspaceQuery } from "@/hooks/use-workspace";
import { Calendar } from "../ui/calendar";
import { toast } from "sonner";

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
    const location = useLocation();
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const { user, logout } = useAuth();

    const [open, setOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // ==========================================
    // 1. DETERMINE USER ROLE IN WORKSPACE
    // ==========================================
    const isOwner = selectedWorkspace?.owner === user?._id;
    const currentMember = selectedWorkspace?.members?.find(m => (m.user?._id || m.user) === user?._id);
    const isAdmin = currentMember?.role === "admin";
    const isMember = !isOwner && !isAdmin;

    // 2. FETCH DATA BASED ON ROLE
    // Fetch user's tasks (0 arguments)
    // Fetch user's tasks (pass the workspaceId)
    const { data: myTasks } = useGetMyTasksQuery(selectedWorkspace?._id) as { data: any[] };

    // Fetch ALL workspace tasks (1 argument: workspaceId)
    const { data: allWorkspaceTasks } = useGetWorkspaceTasksQuery(selectedWorkspace?._id) as { data: any[] };

    // Fetch Projects (1 argument: workspaceId)
    const { data: projectsData } = useGetWorkspaceQuery(selectedWorkspace?._id || "") as { data: any };
    const workspaceProjects: Project[] = Array.isArray(projectsData) ? projectsData : projectsData?.projects || [];

    // 3. PROCESS DATES FOR CALENDAR MODIFIERS
    // Combine tasks based on role (Admins see all, Members see theirs, Owners see none)
    const relevantTasks = isAdmin ? allWorkspaceTasks : myTasks;
    const activeTasks = (!isOwner && relevantTasks) ? relevantTasks.filter((t: any) => t.dueDate && t.status !== "Done") : [];
    const taskDates = activeTasks.map((t: any) => new Date(t.dueDate));

    // Process Projects (Hidden from normal Members)
    const activeProjects = ((isOwner || isAdmin) && workspaceProjects) ? workspaceProjects.filter((p: Project) => p.dueDate && p.status !== "Completed" && !p.isArchived) : [];
    const projectDates = activeProjects.map((p: Project) => new Date(p.dueDate!));

    const handleOnClick = (workspace: Workspace) => {
        onWorkspaceSelected(workspace);
        navigate(`/dashboard?workspaceId=${workspace._id}`);
        if (location.pathname === "/my-tasks") {
            navigate(`/my-tasks?workspaceId=${workspace._id}`);
        }
        // Bonus: Same logic for members page if you want!
        else if (location.pathname === "/members") {
            navigate(`/members?workspaceId=${workspace._id}`);
        }
        // Otherwise, safely default to Dashboard
        else {
            navigate(`/dashboard?workspaceId=${workspace._id}`);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    const [theme, setTheme] = useState<"light" | "dark">(() => (localStorage.getItem("theme") as "light" | "dark") || "light");
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;

        if (savedTheme) {
            setTheme(savedTheme);

            if (savedTheme === "dark") {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
        }
    }, []);
    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        if (newTheme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    // Hover Handlers for Calendar
    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsCalendarOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => setIsCalendarOpen(false), 200);
    };
    const hasUrgentItems = taskDates.some(d => isToday(d)) || projectDates.some(d => isToday(d));
    return (
        <div className="bg-background sticky top-0 z-40 border-b">
            <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center gap-3">
                    {/* --- WORKSPACE SELECTOR --- */}
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
                                    <DropdownMenuItem key={ws._id} onClick={() => handleOnClick(ws)}>
                                        {ws.color && <WorkspaceAvatar color={ws.color} name={ws.name} />}
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
                    {/* --- HOVERABLE CALENDAR POPOVER --- */}
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <PopoverTrigger asChild>
                            <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="
    relative w-10 h-10 rounded-xl
    bg-background
    border border-border
    shadow-sm
    hover:shadow-md
    hover:border-primary/40
    hover:bg-primary/5
    transition-all duration-300
    hover:scale-105
    p-0
  "
                                >
                                    {/* Top Month Strip */}
                                    <div className="
    absolute top-0 left-0 w-full
    text-[9px] font-bold tracking-wide
    uppercase text-primary
    bg-primary/10
    rounded-t-xl
    py-0
  ">
                                        {new Date().toLocaleString("default", { month: "short" })}
                                    </div>

                                    {/* Big Date */}
                                    <span className="
    mt-2 text-[16px] font-extrabold
    text-foreground
  ">
                                        {new Date().getDate()}
                                    </span>

                                    {/* Urgent indicator */}
                                    {hasUrgentItems && (
                                        <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-background"></span>
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </PopoverTrigger>
                        <PopoverContent
                            // ✅ THE GLASSY POPOVER CONTAINER
                            className="w-auto p-4 rounded-2xl mr-4 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl border-white/20 dark:border-slate-800/50 shadow-2xl ring-1 ring-black/5 dark:ring-white/5"
                            align="end"
                            onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
                        >
                            <Calendar
                                // ✅ STYLING FOR THE CALENDAR GRID
                                className="
  p-2
  text-sm
  font-medium
  [&_.rdp-day]:h-8
  [&_.rdp-day]:w-8
  [&_.rdp-day]:text-[13px]
  [&_.rdp-day]:rounded-full
  [&_.rdp-day:hover]:bg-muted
"
                                modifiers={{
                                    taskDate: taskDates,
                                    projectDate: projectDates,
                                    today: new Date()
                                }}
                                modifiersClassNames={{
                                    // 🔴 TASK DOT (perfectly centered)
                                    taskDate:
                                        "relative after:absolute after:bottom-[3px] after:left-1/2 after:-translate-x-1/2 after:w-[4px] after:h-[4px] after:bg-red-500 after:rounded-full font-medium",

                                    // 🟣 PROJECT DATE (clean ring instead of border)
                                    projectDate:
                                        "relative ring-2 ring-purple-500/70 dark:ring-purple-400/70 bg-purple-500/10 dark:bg-purple-400/10 font-semibold rounded-full",

                                    // 🔵 TODAY
                                    today:
                                        "rounded-full bg-primary text-primary-foreground font-bold ring-2 ring-primary/50 ring-offset-2 ring-offset-background",
                                }}
                                onDayClick={(day, modifiers) => {
                                    const dateString = format(day, "yyyy-MM-dd");

                                    // Get all tasks and projects for this specific day
                                    const tasksOnDay = activeTasks.filter((t: any) =>
                                        t.dueDate && new Date(t.dueDate).toDateString() === day.toDateString()
                                    );

                                    const projectsOnDay = activeProjects.filter((p: Project) =>
                                        p.dueDate && new Date(p.dueDate).toDateString() === day.toDateString()
                                    );

                                    const taskCount = tasksOnDay.length;
                                    const projectCount = projectsOnDay.length;

                                    // =======================================================
                                    // SCENARIO 1: EXACTLY 1 TASK, 0 PROJECTS
                                    // =======================================================
                                    if (taskCount === 1 && projectCount === 0) {
                                        const task = tasksOnDay[0];
                                        const projectId = task.project._id || task.project;
                                        navigate(`/workspaces/${selectedWorkspace?._id}/projects/${projectId}/tasks/${task._id}`);
                                        setIsCalendarOpen(false);
                                        return;
                                    }

                                    // =======================================================
                                    // SCENARIO 2: MULTIPLE TASKS, 0 PROJECTS
                                    // =======================================================
                                    if (taskCount > 1 && projectCount === 0) {
                                        navigate(`/my-tasks?workspaceId=${selectedWorkspace?._id}&date=${dateString}`);
                                        setIsCalendarOpen(false);
                                        return;
                                    }

                                    // =======================================================
                                    // SCENARIO 3: EXACTLY 1 PROJECT, 0 TASKS
                                    // =======================================================
                                    if (projectCount === 1 && taskCount === 0) {
                                        navigate(`/workspaces/${selectedWorkspace?._id}/projects/${projectsOnDay[0]._id}`);
                                        setIsCalendarOpen(false);
                                        return;
                                    }

                                    // =======================================================
                                    // SCENARIO 4: 1 PROJECT AND 1+ TASKS (THE EDGE CASE)
                                    // =======================================================
                                    if (projectCount === 1 && taskCount > 0) {
                                        const project = projectsOnDay[0];

                                        // Check if EVERY task on this day belongs to this specific project
                                        const allTasksBelongToProject = tasksOnDay.every((t: any) => {
                                            const tProjectId = t.project._id || t.project;
                                            return tProjectId.toString() === project._id.toString();
                                        });

                                        if (allTasksBelongToProject) {
                                            // Perfect match! Go to the project page.
                                            navigate(`/workspaces/${selectedWorkspace?._id}/projects/${project._id}`);
                                        } else {
                                            // Conflict! Unrelated tasks are due today.
                                            // Go to My Tasks to show actionable items, but alert them about the Project.
                                            toast.info(`Reminder: The project '${project.title}' is also due today!`, {
                                                position: "top-center"
                                            });
                                            navigate(`/my-tasks?workspaceId=${selectedWorkspace?._id}&date=${dateString}`);
                                        }

                                        setIsCalendarOpen(false);
                                        return;
                                    }

                                    // =======================================================
                                    // SCENARIO 5: MULTIPLE PROJECTS DUE
                                    // =======================================================
                                    if (projectCount > 1) {
                                        toast.info(`You have ${projectCount} projects and ${taskCount} tasks due today!`, {
                                            position: "top-center"
                                        });
                                        navigate(`/dashboard?workspaceId=${selectedWorkspace?._id}`);
                                        setIsCalendarOpen(false);
                                        return;
                                    }
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="flex items-center gap-0.5">
                    <div className="flex items-center gap-3">
                        {/* --- THEME TOGGLE --- */}
                        <div
                            onClick={toggleTheme}
                            className="relative w-14 h-7 bg-muted rounded-full cursor-pointer transition-colors duration-300 flex items-center"
                        >
                            <div
                                className={`absolute w-6 h-6 rounded-full bg-background shadow-md transition-transform duration-300 ${theme === "dark" ? "translate-x-7" : "translate-x-1"
                                    }`}
                            />
                            <div className="flex w-full justify-between px-2 z-10">
                                <Sun className={`w-4 h-4 ${theme === "light" ? "text-yellow-500" : "text-muted-foreground"}`} />
                                <Moon className={`w-4 h-4 ${theme === "dark" ? "text-blue-500" : "text-muted-foreground"}`} />
                            </div>
                        </div>

                        {/* --- NOTIFICATIONS --- */}
                        {user && (
                            <div className="relative flex items-center justify-center w-9 h-9 hover:bg-muted rounded-full transition-all duration-200 cursor-pointer">
                                <NotificationBell userId={user._id} />
                            </div>
                        )}
                    </div>

                    {/* --- USER PROFILE DROPDOWN --- */}
                    <DropdownMenu open={open} onOpenChange={setOpen}>
                        <DropdownMenuTrigger asChild>
                            <div className="flex items-center gap-1 px-3 py-2 rounded-lg cursor-pointer transition-colors ml-2">
                                <Avatar className="h-9 w-9 rounded-lg overflow-hidden border">
                                    <AvatarImage
                                        src={
                                            user?.profilePicture?.startsWith("http")
                                                ? user.profilePicture
                                                : user?.profilePicture
                                                    ? `${BACKEND_URL}${user.profilePicture}`
                                                    : undefined
                                        }
                                    />
                                    <AvatarFallback className="rounded-lg bg-muted/70 text-foreground">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                <span className="font-semibold text-sm tracking-wide text-foreground uppercase">
                                    {user?.name}
                                </span>

                                <svg
                                    className="w-5 h-5 text-blue-400"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" sideOffset={10} onMouseLeave={() => setOpen(false)} className="w-40 rounded-xl border bg-card shadow-lg p-2">
                            <DropdownMenuItem asChild className="flex items-center gap-3 px-4 py-3 rounded-lg text-base hover:bg-muted cursor-pointer">
                                <Link to="/user/profile">
                                    <UserCircle className="w-5 h-5 text-muted-foreground" />
                                    <span>My Profile</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-base text-destructive hover:bg-destructive/10 cursor-pointer">
                                <LogOut className="w-5 h-5" />
                                <span>Logout</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}