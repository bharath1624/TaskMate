import { projectSchema } from "@/lib/schema";
import { ProjectStatus, type MemberProps } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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

    // ✅ FIX: Get raw data and cast to 'any' to avoid TypeScript errors
    const { data: rawData } = useUserProfileQuery();
    const userData = rawData as any;
    const currentUserId = userData?.user?._id || userData?._id;

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
            <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Project</DialogTitle>
                    <DialogDescription>
                        Create a new project to get started
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Title */}
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Project Title</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Project Title" />
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
                                    <FormLabel>Project Description</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} placeholder="Project Description" rows={3} value={field.value || ""} />
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
                                            <Popover modal={true}>
                                                <PopoverTrigger asChild>
                                                    <Button variant={"outline"} className={"w-full justify-start text-left font-normal " + (!field.value ? "text-muted-foreground" : "")}>
                                                        <CalendarIcon className="size-4 mr-2" />
                                                        {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={(date) => field.onChange(date?.toISOString())} initialFocus />
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
                                            <Popover modal={true}>
                                                <PopoverTrigger asChild>
                                                    <Button variant={"outline"} className={"w-full justify-start text-left font-normal " + (!field.value ? "text-muted-foreground" : "")}>
                                                        <CalendarIcon className="size-4 mr-2" />
                                                        {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={(date) => field.onChange(date?.toISOString())} initialFocus />
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
                                        <Input {...field} value={Array.isArray(field.value) ? field.value.join(", ") : (field.value || "")} onChange={(e) => field.onChange(e.target.value)} placeholder="Tags separated by comma (e.g., Role, Management)" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Members - Filter Logic Applied */}
                        <FormField
                            control={form.control}
                            name="members"
                            render={({ field }) => {
                                const selectedMembers = field.value || [];

                                // ✅ Safe filtering using optional chaining
                                const availableMembers = workspaceMembers.filter(
                                    (member) => member.role !== "owner"
                                );

                                return (
                                    <FormItem>
                                        <FormLabel>Assignes</FormLabel>
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
                                                <PopoverContent className="w-full max-w-xs p-2" align="start">
                                                    <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
                                                        {availableMembers.map((member) => {
                                                            const isSelected = selectedMembers.some((m) => m.user === member.user._id);
                                                            return (
                                                                <div
                                                                    key={member._id}
                                                                    className="flex items-center space-x-2 p-2 rounded hover:bg-slate-100 cursor-pointer"
                                                                    onClick={() => {
                                                                        if (isSelected) {
                                                                            field.onChange(selectedMembers.filter((m) => m.user !== member.user._id));
                                                                        } else {
                                                                            field.onChange([
                                                                                ...selectedMembers,
                                                                                { user: member.user._id, role: "contributor" },
                                                                            ]);
                                                                        }
                                                                    }}
                                                                >
                                                                    <Checkbox checked={isSelected} />
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm font-medium">{member.user.name}</span>
                                                                        <span className="text-xs text-muted-foreground capitalize">{member.role}</span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? "Creating..." : "Create Project"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};