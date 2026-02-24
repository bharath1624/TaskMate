import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { UseProjectQuery, UseUpdateProject, UseDeleteProject, UseToggleArchiveProject } from "@/hooks/use-project";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Archive, ArrowLeft, CalendarIcon, Check, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/provider/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const getImageUrl = (path: string | undefined | null) => {
    if (!path) return undefined;
    if (path.startsWith("http")) return path;
    const BASE = "http://localhost:5000";
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${BASE}${cleanPath}`;
};

const ProjectSettings = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { projectId, workspaceId } = useParams<{ projectId: string; workspaceId: string }>();

    // 1. HOOKS
    // ✅ FIX: Cast result to include 'canEdit'
    const { data, isLoading } = UseProjectQuery(projectId!) as any;
    const { mutate: deleteProject, isPending: isDeleting } = UseDeleteProject();
    const { mutate: updateProject, isPending: isUpdating } = UseUpdateProject();
    const { mutate: toggleArchive, isPending: isArchiving } = UseToggleArchiveProject();

    // 2. STATE
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("Planning");
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
    const [members, setMembers] = useState<string[]>([]);

    // 3. EFFECT: Load Data
    useEffect(() => {
        if (data?.project) {
            const p = data.project;
            setTitle(p.title || "");
            setDescription(p.description || "");
            setStatus(p.status || "Planning");
            setStartDate(p.startDate ? new Date(p.startDate) : undefined);
            setDueDate(p.dueDate ? new Date(p.dueDate) : undefined);

            const memberIds = p.members?.map((m: any) => m.user?._id || m.user) || [];
            setMembers(memberIds);
        }
    }, [data]);

    if (isLoading || isDeleting) return <Loader />;
    if (!data?.project) return <div className="p-8 text-foreground">Project not found</div>;

    const { project, workspaceMembers = [], canEdit } = data;

    // 4. ✅ PERMISSION CHECK: Use the backend flag directly
    if (!canEdit) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                <h2 className="text-xl font-bold text-destructive">Access Denied</h2>
                <p className="text-muted-foreground">You do not have permission to view these settings.</p>
                <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
            </div>
        );
    }

    // 5. DIRTY CHECK
    const isDirty =
        title !== project.title ||
        description !== (project.description || "") ||
        status !== (project.status || "Planning") ||
        startDate?.toISOString() !== (project.startDate ? new Date(project.startDate).toISOString() : undefined) ||
        dueDate?.toISOString() !== (project.dueDate ? new Date(project.dueDate).toISOString() : undefined) ||
        JSON.stringify(members.sort()) !== JSON.stringify(project.members.map((m: any) => m.user?._id || m.user).sort());

    const isMemberChecked = (userId: string) => members.includes(userId);

    const toggleMember = (userId: string) => {
        if (members.includes(userId)) {
            setMembers(members.filter(id => id !== userId));
        } else {
            setMembers([...members, userId]);
        }
    };

    // 6. HANDLERS
    const handleUpdate = () => {
        updateProject(
            {
                projectId: projectId!,
                payload: {
                    title,
                    description,
                    status,
                    startDate: startDate?.toISOString(),
                    dueDate: dueDate?.toISOString(),
                    members
                }
            },
            {
                onSuccess: () => toast.success("Project updated successfully"),
                onError: () => toast.error("Failed to update project"),
            }
        );
    };

    const handleDelete = () => {
        deleteProject({ projectId: projectId! }, {
            onSuccess: () => {
                toast.success("Project deleted permanently");
                navigate(`/workspaces/${workspaceId}`, { replace: true });
            },
            //onError: (err: any) => toast.error(err.response?.data?.message || "Delete failed"),
        });
    };
    const handleToggleArchive = () => {
        toggleArchive({ projectId: projectId! });
    };

    return (
        <div className="relative min-h-screen bg-background">
            <div className="flex justify-center w-full pt-16 pb-20">
                <div className="w-full max-w-5xl space-y-8 px-4 sm:px-6">
                    <Card className="shadow-sm border border-border bg-card">
                        <CardHeader>
                            <div className="flex flex-col gap-1">
                                <h2 className="text-2xl font-bold tracking-tight">Project Settings</h2>
                                <p className="text-sm text-muted-foreground">Manage project details, status, timeline, and team members.</p>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-8 pt-6">
                            {/* Title & Description */}
                            <div className="space-y-8">
                                <div className="grid grid-cols-[100px_1fr]  gap-3">
                                    <label className="text-base font-semibold text-foreground mt-1">Project Title</label>
                                    <Input value={title} onChange={(e) => setTitle(e.target.value)} disabled={!canEdit} />
                                </div>
                                <div className="space-y-7">
                                    <label className="text-base font-semibold text-foreground mt-1">Description</label>
                                    <Textarea
                                        className="min-h-[120px] resize-none"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        disabled={!canEdit}
                                    />
                                </div>
                            </div>

                            {/* Status & Dates */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-[60px_1fr] items-center gap-4">
                                    <label className="text-base font-semibold text-foreground">Status</label>
                                    <Select value={status} onValueChange={setStatus} disabled={!canEdit}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Planning">Planning</SelectItem>
                                            <SelectItem value="In Progress">In Progress</SelectItem>
                                            <SelectItem value="On Hold">On Hold</SelectItem>
                                            <SelectItem value="Completed">Completed</SelectItem>
                                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 mb-2">
                                        <label className="text-base font-semibold text-foreground">Start Date</label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start text-left font-normal" disabled={!canEdit}>
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-base font-semibold text-foreground">Due Date</label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start text-left font-normal" disabled={!canEdit}>
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            </div>

                            {/* Members Selection */}
                            <div className="space-y-3">
                                <label className="text-base font-semibold text-foreground">Project Members</label>
                                <div className={`border border-border rounded-lg p-1 bg-muted/30 ${!canEdit ? "opacity-60 pointer-events-none" : ""}`}>
                                    <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
                                        {workspaceMembers.map((member: any) => {
                                            if (!member?.user) return null;
                                            const userId = member.user._id;
                                            const isSelected = isMemberChecked(userId);
                                            return (
                                                <div
                                                    key={userId}
                                                    className={cn("flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors border", isSelected
                                                        ? "bg-accent border-primary/20 shadow-sm"
                                                        : "border-transparent hover:bg-muted"
                                                    )}
                                                    onClick={() => toggleMember(userId)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8 border">
                                                            <AvatarImage src={getImageUrl(member.user.profilePicture)} />
                                                            <AvatarFallback>{member.user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-sm font-medium leading-none">{member.user.name}</p>
                                                            <p className="text-xs text-muted-foreground capitalize mt-1">{member.role}</p>
                                                        </div>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shadow-md">
                                                            <Check className="h-3 w-3 text-primary-foreground" />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button size="lg" disabled={!isDirty || isUpdating} onClick={handleUpdate}>
                                    {isUpdating ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-gray-200">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-semibold text-foreground">Archive Project</h3>
                                    <p className="text-sm text-muted-foreground">{project.isArchived ? "This project is currently archived." : "Archiving removes this project from active views."}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-end">
                                <Button variant={project.isArchived ? "default" : "secondary"} onClick={handleToggleArchive} disabled={isArchiving || !canEdit} className="min-w-[140px]">
                                    {isArchiving ? <Loader className="h-4 w-4 animate-spin" /> : project.isArchived ? <><RotateCcw className="mr-2 h-4 w-4" /> Restore Project</> : <><Archive className="mr-2 h-4 w-4" /> Archive Project</>}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-destructive/40 bg-destructive/5 shadow-sm">
                        <CardHeader className="pb-4">
                            <h3 className="text-lg font-semibold text-red-600">Danger Zone</h3>
                            <p className="text-sm text-muted-foreground">Irreversible actions for this project.</p>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-end">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild><Button variant="destructive">Delete Project</Button></AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Project?</AlertDialogTitle>
                                            <AlertDialogDescription>This action cannot be undone. This will permanently delete <span className="font-semibold text-foreground">"{title}"</span>.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction type="button" className="bg-red-600 hover:bg-red-700" disabled={isDeleting} onClick={handleDelete}>{isDeleting ? "Deleting..." : "Confirm Delete"}</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ProjectSettings;