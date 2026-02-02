import type { ProjectMemberRole, Task, User } from "@/types";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { useUpdateTaskAssigneesMutation } from "@/hooks/use-task";
import { toast } from "sonner";
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

    const handleSelectAll = () => {
        // Only select from filtered members (excluding owner)
        const allIds = filteredMembers.map((m) => m.user._id);
        setSelectedIds(allIds);
    };

    const handleUnSelectAll = () => {
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

    const handleSave = () => {
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

    return (
        <div className="mb-6">
            <h3 className="text-sm font-medium">Assignees</h3>

            <div className="flex flex-wrap gap-2 mb-2">
                {selectedIds.length === 0 ? (
                    <span className="text-xs text-muted-foreground">Unassigned</span>
                ) : (
                    // Show selected users (even if they are owner, just in case they were already assigned)
                    projectMembers
                        .filter((member) => selectedIds.includes(member.user._id))
                        .map((m) => (
                            <div
                                key={m.user._id}
                                className="flex items-center bg-gray-100 rounded px-2 py-1"
                            >
                                <Avatar className="size-6 mr-1">
                                    <AvatarImage
                                        src={
                                            m.user.profilePicture
                                                ? `${BACKEND_URL}${m.user.profilePicture}`
                                                : undefined
                                        }
                                    />
                                    <AvatarFallback>{m.user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground">
                                    {m.user.name}
                                </span>
                            </div>
                        ))
                )}
            </div>

            {/* dropdown */}
            <div className="relative">
                <button
                    className="text-sm text-muted-foreground w-full border rounded px-3 py-2 text-left bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setDropDownOpen(!dropDownOpen)}
                    disabled={!canEdit}
                >
                    {selectedIds.length === 0
                        ? "Select assignees"
                        : `${selectedIds.length} selected`}
                </button>

                {dropDownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
                        <div className="flex justify-between px-2 py-1 border-b">
                            <button
                                className="text-xs text-blue-600"
                                onClick={handleSelectAll}
                            >
                                Select all
                            </button>
                            <button
                                className="text-xs text-red-600"
                                onClick={handleUnSelectAll}
                            >
                                Unselect all
                            </button>
                        </div>

                        {/* ✅ USE filteredMembers HERE */}
                        {filteredMembers.map((m) => (
                            <label
                                className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-50"
                                key={m.user._id}
                            >
                                <Checkbox
                                    checked={selectedIds.includes(m.user._id)}
                                    onCheckedChange={() => handleSelect(m.user._id)}
                                    className="mr-2"
                                />
                                <Avatar className="size-6 mr-1">
                                    <AvatarImage
                                        src={
                                            m.user.profilePicture
                                                ? `${BACKEND_URL}${m.user.profilePicture}`
                                                : undefined
                                        }
                                    />
                                    <AvatarFallback>{m.user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span>{m.user.name}</span>
                            </label>
                        ))}

                        <div className="flex justify-between px-2 py-1">
                            <Button
                                variant={"outline"}
                                size={"sm"}
                                className="font-light"
                                onClickCapture={() => setDropDownOpen(false)}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                size={"sm"}
                                className="font-light"
                                disabled={isPending}
                                onClickCapture={() => handleSave()}
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};