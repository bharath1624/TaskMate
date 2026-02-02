import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useCreateTaskMutation } from "@/hooks/use-task";
import { createTaskSchema } from "@/lib/schema";
import type { ProjectMemberRole, User } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown, Search, User as UserIcon, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/provider/auth-context";

const getImageUrl = (path: string | undefined | null) => {
    if (!path) return undefined;
    if (path.startsWith("http")) return path;
    const BASE = "http://localhost:5000";
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${BASE}${cleanPath}`;
};

interface CreateTaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: string;
    projectMembers: { user: User; role: ProjectMemberRole }[];
    workspaceMembers: { user: User; role: string }[];
}

export type CreateTaskFormData = z.infer<typeof createTaskSchema>;

export const CreateTaskDialog = ({
    open,
    onOpenChange,
    projectId,
    projectMembers,
    workspaceMembers,
}: CreateTaskDialogProps) => {
    const { user: currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");

    const form = useForm<CreateTaskFormData>({
        resolver: zodResolver(createTaskSchema),
        defaultValues: {
            title: "",
            description: "",
            status: "To Do",
            priority: "Medium",
            dueDate: "",
            assignees: [],
        },
    });

    const { mutate, isPending } = useCreateTaskMutation();

    const onSubmit = (values: CreateTaskFormData) => {
        mutate(
            { projectId, taskData: values },
            {
                onSuccess: () => {
                    toast.success("Task created successfully");
                    form.reset();
                    onOpenChange(false);
                },
                onError: (error: any) => {
                    const errorMessage = error.response?.data?.message || "Failed to create task";
                    toast.error(errorMessage);
                },
            }
        );
    };

    // 🔒 1. Find Owner ID
    const ownerMember = workspaceMembers.find(m => m.role === 'owner');
    const ownerId = ownerMember?.user._id;

    // 🔒 2. Filter out Owner from Search List
    const assignableMembers = projectMembers.filter(
        (m) => m.user._id !== ownerId
    );

    // 🔒 3. Check if CURRENT USER is the Owner (to hide "Assign to me")
    const isCurrentUserOwner = currentUser?._id === ownerId;

    const filteredMembers = assignableMembers.filter((m) =>
        m.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAssignToMe = () => {
        if (!currentUser?._id) return;
        const currentAssignees = form.getValues("assignees") || [];
        const isAlreadyAssigned = currentAssignees.includes(currentUser._id);

        if (isAlreadyAssigned) {
            form.setValue("assignees", currentAssignees.filter(id => id !== currentUser._id));
        } else {
            form.setValue("assignees", [...currentAssignees, currentUser._id]);
        }
    };

    const isMeAssigned = (form.watch("assignees") || []).includes(currentUser?._id || "");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Task</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid gap-5 py-2">
                            {/* Title */}
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Task Title</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="What needs to be done?" className="text-md" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Description */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Add details about this task..." className="resize-none min-h-[100px]" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Status & Priority */}
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="To Do">To Do</SelectItem>
                                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                                    <SelectItem value="Done">Done</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="priority"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Priority</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Low">Low</SelectItem>
                                                    <SelectItem value="Medium">Medium</SelectItem>
                                                    <SelectItem value="High">High</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Date & Assignees */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="dueDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Due Date</FormLabel>
                                            <FormControl>
                                                <Popover modal={true}>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                                                            <CalendarIcon className="size-4 mr-2" />
                                                            {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={(date) => field.onChange(date?.toISOString())} initialFocus />
                                                    </PopoverContent>
                                                </Popover>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="assignees"
                                    render={({ field }) => {
                                        const selectedIds = field.value || [];
                                        const selectedMembers = assignableMembers.filter(m => selectedIds.includes(m.user._id));

                                        return (
                                            <FormItem>
                                                <div className="flex items-center justify-between">
                                                    <FormLabel>Assignees</FormLabel>

                                                    {/* ✅ HIDE BUTTON IF OWNER */}
                                                    {!isCurrentUserOwner && (
                                                        <button
                                                            type="button"
                                                            onClick={handleAssignToMe}
                                                            className={cn(
                                                                "text-[11px] font-medium px-2 py-0.5 rounded-full transition-colors flex items-center gap-1",
                                                                isMeAssigned
                                                                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                                                                    : "bg-primary/10 text-primary hover:bg-primary/20"
                                                            )}
                                                        >
                                                            <UserPlus className="size-3" />
                                                            {isMeAssigned ? "Remove me" : "Assign to me"}
                                                        </button>
                                                    )}
                                                </div>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" className="w-full justify-between px-3 h-10">
                                                            {selectedIds.length > 0 ? (
                                                                <div className="flex items-center gap-2">
                                                                    <div className="flex -space-x-2">
                                                                        {selectedMembers.slice(0, 3).map((m) => (
                                                                            <Avatar key={m.user._id} className="h-6 w-6 border-2 border-background">
                                                                                <AvatarImage src={getImageUrl(m.user.profilePicture)} />
                                                                                <AvatarFallback className="text-[10px]">{m.user.name.charAt(0)}</AvatarFallback>
                                                                            </Avatar>
                                                                        ))}
                                                                    </div>
                                                                    <span className="text-sm">
                                                                        {selectedMembers.length === 1 ? selectedMembers[0].user.name : `${selectedMembers.length} selected`}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted-foreground flex items-center gap-2">
                                                                    <UserIcon className="size-4" /> Select team
                                                                </span>
                                                            )}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-[300px] p-0" align="start">
                                                        <div className="p-2 border-b">
                                                            <div className="flex items-center px-2 py-1 bg-muted/50 rounded-md">
                                                                <Search className="size-4 text-muted-foreground mr-2" />
                                                                <input
                                                                    className="flex-1 bg-transparent border-none text-sm focus:outline-none"
                                                                    placeholder="Search members..."
                                                                    value={searchTerm}
                                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="max-h-[200px] overflow-y-auto p-1">
                                                            {filteredMembers.map((member) => {
                                                                const isSelected = selectedIds.includes(member.user._id);
                                                                const workspaceMember = workspaceMembers.find(wm => wm.user._id === member.user._id);
                                                                const displayRole = workspaceMember ? workspaceMember.role : (member.role as string);

                                                                return (
                                                                    <div
                                                                        key={member.user._id}
                                                                        className={cn("flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-muted transition-colors", isSelected && "bg-muted")}
                                                                        onClick={() => {
                                                                            if (isSelected) {
                                                                                field.onChange(selectedIds.filter(id => id !== member.user._id));
                                                                            } else {
                                                                                field.onChange([...selectedIds, member.user._id]);
                                                                            }
                                                                        }}
                                                                    >
                                                                        <div className={cn("flex h-4 w-4 items-center justify-center rounded border border-primary", isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                                                                            <Check className="h-3 w-3" />
                                                                        </div>
                                                                        <Avatar className="h-8 w-8">
                                                                            <AvatarImage src={getImageUrl(member.user.profilePicture)} />
                                                                            <AvatarFallback>{member.user.name.charAt(0)}</AvatarFallback>
                                                                        </Avatar>
                                                                        <div className="flex flex-col">
                                                                            <span className="text-sm font-medium">{member.user.name}</span>
                                                                            <span className="text-[10px] text-muted-foreground capitalize">{displayRole}</span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        );
                                    }}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                                {isPending ? "Creating..." : "Create Task"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};