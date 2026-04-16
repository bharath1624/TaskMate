import { projectSchema } from "@/lib/schema";
import { ProjectStatus, type MemberProps } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react"; // ✅ Added useState
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";

import { format } from "date-fns";
import { CalendarIcon, UserIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { toast } from "sonner";
import { UseCreateProject } from "@/hooks/use-project";
import { Checkbox } from "../ui/checkbox";
import { useUserProfileQuery } from "@/hooks/use-auth";

interface CreateProjectDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    workspaceId: string;
    workspaceMembers: MemberProps[];
}

export type CreateProjectFormData = z.infer<typeof projectSchema>;

export const CreateProjectDialog = ({
    isOpen,
    onOpenChange,
    workspaceId,
    workspaceMembers,
}: CreateProjectDialogProps) => {

    const { data: rawData } = useUserProfileQuery();
    const userData = rawData as any;
    const currentUserId = userData?.user?._id || userData?._id;

    // ✅ Added states to control Popover visibility
    const [isStartPopoverOpen, setIsStartPopoverOpen] = useState(false);
    const [isDuePopoverOpen, setIsDuePopoverOpen] = useState(false);

    const form = useForm<CreateProjectFormData>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            title: "",
            description: "",
            status: ProjectStatus.PLANNING,
            startDate: undefined,
            dueDate: undefined,
            members: [],
            tags: "",
        },
    });

    const { mutate, isPending } = UseCreateProject();

    const onSubmit = (values: CreateProjectFormData) => {
        if (!workspaceId) return;

        const memberIds = values.members?.map((m: any) => {
            return typeof m === 'object' && m.user ? m.user : m;
        }) || [];

        const payload = {
            title: values.title,
            description: values.description,
            status: values.status,
            members: memberIds,
            startDate: values.startDate ? new Date(values.startDate).toISOString() : undefined,
            dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : undefined,
        };

        mutate(
            {
                projectData: payload as any,
                workspaceId,
            },
            {
                onSuccess: () => {
                    toast.success("Project created successfully");
                    form.reset();
                    onOpenChange(false);
                },
                onError: (error: any) => {
                    const errorMessage = error.response?.data?.message || "Failed to create project";
                    toast.error(errorMessage);
                },
            }
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[540px] max-h-[90vh] flex flex-col p-0 overflow-hidden bg-background">

                {/* Fixed Header */}
                <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
                    <DialogTitle>Create Project</DialogTitle>
                    <DialogDescription>
                        Create a new project to get started
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden min-h-0">

                        {/* Scrollable Form Body */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 pb-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full">
                            {/* Title */}
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Project Title</FormLabel>
                                        <FormControl>
                                            <Input {...field}
                                                placeholder="Enter Project name" />
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
                                            <Textarea {...field} placeholder="Describe about project" rows={3} value={field.value || ""} className="resize-none" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Status */}
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Project Status</FormLabel>
                                        <FormControl>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select Project Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.values(ProjectStatus).map((status) => (
                                                        <SelectItem key={status} value={status}>
                                                            {status}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Start Date</FormLabel>
                                            <FormControl>
                                                {/* ✅ Added open and onOpenChange props */}
                                                <Popover modal={true} open={isStartPopoverOpen} onOpenChange={setIsStartPopoverOpen}>
                                                    <PopoverTrigger asChild>
                                                        <Button variant={"outline"} className={"w-full justify-start text-left font-normal " + (!field.value ? "text-muted-foreground" : "")}>
                                                            <CalendarIcon className="size-4 mr-2 shrink-0" />
                                                            <span className="truncate">{field.value ? format(new Date(field.value), "PPP") : "Pick a date"}</span>
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value ? new Date(field.value) : undefined}
                                                            onSelect={(date) => {
                                                                field.onChange(date?.toISOString());
                                                                setIsStartPopoverOpen(false); // ✅ Close popover on select
                                                            }}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="dueDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Due Date</FormLabel>
                                            <FormControl>
                                                {/* ✅ Added open and onOpenChange props */}
                                                <Popover modal={true} open={isDuePopoverOpen} onOpenChange={setIsDuePopoverOpen}>
                                                    <PopoverTrigger asChild>
                                                        <Button variant={"outline"} className={"w-full justify-start text-left font-normal " + (!field.value ? "text-muted-foreground" : "")}>
                                                            <CalendarIcon className="size-4 mr-2 shrink-0" />
                                                            <span className="truncate">{field.value ? format(new Date(field.value), "PPP") : "Pick a date"}</span>
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value ? new Date(field.value) : undefined}
                                                            onSelect={(date) => {
                                                                field.onChange(date?.toISOString());
                                                                setIsDuePopoverOpen(false); // ✅ Close popover on select
                                                            }}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Tags */}
                            <FormField
                                control={form.control}
                                name="tags"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tags</FormLabel>
                                        <FormControl>
                                            {/* @ts-ignore */}
                                            <Input {...field} value={Array.isArray(field.value) ? field.value.join(", ") : (field.value || "")} onChange={(e) => field.onChange(e.target.value)} placeholder="Tags separated by comma" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Members */}
                            <FormField
                                control={form.control}
                                name="members"
                                render={({ field }) => {
                                    const selectedMembers = field.value || [];
                                    const availableMembers = workspaceMembers.filter(
                                        (member) => member.role !== "owner"
                                    );

                                    return (
                                        <FormItem>
                                            <FormLabel>Assignees</FormLabel>
                                            <FormControl>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant={"outline"} className="w-full justify-start text-left font-normal min-h-11">
                                                            {selectedMembers.length === 0 ? (
                                                                <span className="text-muted-foreground flex items-center gap-2">
                                                                    <UserIcon className="size-4" /> Select team
                                                                </span>
                                                            ) : (
                                                                `${selectedMembers.length} members selected`
                                                            )}
                                                        </Button>
                                                    </PopoverTrigger>

                                                    <PopoverContent
                                                        className="w-(--radix-popover-trigger-width) p-2"
                                                        align="start"
                                                        side="top"
                                                        sideOffset={4}
                                                    >
                                                        <div className="flex flex-col gap-1 max-h-[180px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full pr-1">
                                                            {availableMembers.map((member) => {
                                                                const isSelected = selectedMembers.some((m) => m.user === member.user._id);
                                                                return (
                                                                    <label
                                                                        key={member._id}
                                                                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                                                                    >
                                                                        <Checkbox
                                                                            checked={isSelected}
                                                                            onCheckedChange={() => {
                                                                                if (isSelected) {
                                                                                    field.onChange(selectedMembers.filter((m) => m.user !== member.user._id));
                                                                                } else {
                                                                                    field.onChange([
                                                                                        ...selectedMembers,
                                                                                        { user: member.user._id, role: "contributor" },
                                                                                    ]);
                                                                                }
                                                                            }}
                                                                        />
                                                                        <div className="flex flex-col leading-tight">
                                                                            <span className="text-sm font-medium">{member.user.name}</span>
                                                                            <span className="text-[11px] text-muted-foreground capitalize">{member.role}</span>
                                                                        </div>
                                                                    </label>
                                                                );
                                                            })}
                                                            {availableMembers.length === 0 && (
                                                                <div className="p-3 text-center text-sm text-muted-foreground">No eligible members found.</div>
                                                            )}
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />
                        </div>

                        {/* Fixed Footer */}
                        <div className="px-6 py-4 border-t bg-background shrink-0 mt-auto flex justify-end relative z-50">
                            <Button type="submit" disabled={isPending} className="w-full sm:w-auto shadow-sm">
                                {isPending ? "Creating..." : "Create Project"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};