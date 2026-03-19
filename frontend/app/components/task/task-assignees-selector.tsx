import type { ProjectMemberRole, Task, User } from "@/types";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { useUpdateTaskAssigneesMutation } from "@/hooks/use-task";
import { toast } from "sonner";
import { Check, Plus, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const TaskAssigneesSelector = ({
    task,
    assignees,
    projectMembers,
    canEdit,
}: {
    task: Task;
    assignees: User[];
    projectMembers: { user: User; role: ProjectMemberRole }[];
    canEdit: boolean;
}) => {
    // ✅ FILTER: Remove Owner from the selectable list
    const filteredMembers = projectMembers.filter(m => (m.role as string) !== "owner");

    const [selectedIds, setSelectedIds] = useState<string[]>(
        assignees.map((assignee) => assignee._id)
    );
    const [dropDownOpen, setDropDownOpen] = useState(false);
    const { mutate, isPending } = useUpdateTaskAssigneesMutation();

    const handleSelectAll = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const allIds = filteredMembers.map((m) => m.user._id);
        setSelectedIds(allIds);
    };

    const handleUnSelectAll = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIds([]);
    };

    const handleSelect = (id: string) => {
        let newSelected: string[] = [];
        if (selectedIds.includes(id)) {
            newSelected = selectedIds.filter((sid) => sid !== id);
        } else {
            newSelected = [...selectedIds, id];
        }
        setSelectedIds(newSelected);
    };

    const handleSave = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        mutate(
            {
                taskId: task._id,
                assignees: selectedIds,
            },
            {
                onSuccess: () => {
                    setDropDownOpen(false);
                    toast.success("Assignees updated successfully");
                },
                onError: (error: any) => {
                    const errMessage =
                        error.response?.data?.message || "Failed to update assignees";
                    toast.error(errMessage);
                },
            }
        );
    };

    const handleCancel = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Reset selection back to original assignees when canceling
        setSelectedIds(assignees.map((assignee) => assignee._id));
        setDropDownOpen(false);
    };

    // Get the actual user objects for the selected IDs to render the avatars
    const selectedUsers = projectMembers
        .filter((member) => selectedIds.includes(member.user._id))
        .map(m => m.user);

    return (
        <div className="relative flex flex-col items-start w-full">

            {/* ================= TRIGGER AREA (Overlapping Avatars) ================= */}
            <div className="flex items-center gap-2 flex-wrap">
                {selectedUsers.length === 0 ? (
                    <div className="text-[13px] text-muted-foreground flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full border border-dashed border-border/60">
                        <UserPlus className="size-3.5" />
                        Assign Someone..
                    </div>
                ) : (
                    <div className="flex -space-x-2.5">
                        {selectedUsers.map((user) => (
                            <div key={user._id} className="relative group cursor-pointer" title={user.name}>
                                <Avatar className="size-8 ring-2 ring-background shadow-sm transition-transform group-hover:-translate-y-1">
                                    <AvatarImage
                                        src={
                                            user.profilePicture
                                                ? (user.profilePicture.startsWith("http")
                                                    ? user.profilePicture
                                                    : `${BACKEND_URL}${user.profilePicture}`)
                                                : undefined
                                        }
                                    />
                                    <AvatarFallback className="bg-linear-to-br from-blue-500 to-indigo-600 text-white text-[10px] font-bold">
                                        {user.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        ))}
                    </div>
                )}

                {canEdit && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDropDownOpen(!dropDownOpen);
                        }}
                        disabled={isPending}
                        className="flex items-center justify-center size-8 rounded-full border border-dashed border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-solid transition-all ml-1 bg-background shadow-sm"
                        title="Manage assignees"
                    >
                        <Plus className="size-4" />
                    </button>
                )}
            </div>

            {/* ================= DROPDOWN MENU (SaaS Glassmorphism) ================= */}
            {dropDownOpen && canEdit && (
                <div className="absolute top-10 left-0 z-50 w-64 bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                    {/* Header Controls */}
                    <div className="flex justify-between items-center px-4 py-2.5 bg-muted/30 border-b border-border/40">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assign to</span>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                className="text-[11px] font-medium text-blue-500 hover:text-blue-600 transition-colors"
                                onClick={handleSelectAll}
                            >
                                All
                            </button>
                            <button
                                type="button"
                                className="text-[11px] font-medium text-muted-foreground hover:text-red-500 transition-colors"
                                onClick={handleUnSelectAll}
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    {/* Members List */}
                    <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
                        {filteredMembers.map((m) => {
                            const isSelected = selectedIds.includes(m.user._id);
                            return (
                                <div
                                    key={m.user._id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelect(m.user._id);
                                    }}
                                    className={cn(
                                        "flex items-center justify-between px-2.5 py-2 rounded-xl cursor-pointer transition-colors",
                                        isSelected ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "hover:bg-muted text-foreground"
                                    )}
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <Avatar className="size-6 shrink-0">
                                            <AvatarImage
                                                src={
                                                    m.user?.profilePicture
                                                        ? (m.user.profilePicture.startsWith('http')
                                                            ? m.user.profilePicture
                                                            : `${BACKEND_URL}${m.user.profilePicture}`)
                                                        : undefined
                                                }
                                            />
                                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-medium">
                                                {m.user?.name?.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className={cn("text-sm truncate", isSelected ? "font-semibold" : "font-medium")}>
                                            {m.user.name}
                                        </span>
                                    </div>

                                    {/* Custom Checkmark instead of Checkbox */}
                                    {isSelected && <Check className="size-4 shrink-0 text-blue-500" />}
                                </div>
                            );
                        })}
                        {filteredMembers.length === 0 && (
                            <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                                No eligible members found.
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-2 px-3 py-2.5 border-t border-border/40 bg-muted/20">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-3 text-xs font-medium hover:bg-muted"
                            onClick={handleCancel}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            className="h-7 px-4 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                            onClick={handleSave}
                            disabled={isPending}
                        >
                            {isPending ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};