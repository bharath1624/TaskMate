import { useUpdateTaskDescriptionMutation } from "@/hooks/use-task";
import { Edit } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

export const TaskDescription = ({ description, taskId, canEdit }: any) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newDescription, setNewDescription] = useState(description);
    const { mutate, isPending } = useUpdateTaskDescriptionMutation();

    const updateDescription = () => {
        mutate(
            { taskId, description: newDescription },
            {
                onSuccess: () => {
                    setIsEditing(false);
                    toast.success("Description updated successfully");
                },
            }
        );
    };

    const cancelEdit = () => {
        setNewDescription(description);
        setIsEditing(false);
    };

    return (
        <div className="grid grid-cols-[1fr_auto] gap-3">
            {/* 👇 height ONLY when editing */}
            <div className={isEditing ? "min-h-[72px]" : ""}>
                {isEditing ? (
                    <Textarea
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        className="resize-none min-h-[72px]"
                        disabled={isPending}
                    />
                ) : (
                    <p className="text-l font-semibold leading-relaxed">
                        {description || "No description"}
                    </p>
                )}
            </div>

            {canEdit && (
                <div className="flex items-start gap-2 shrink-0">
                    {isEditing ? (
                        <>
                            <Button size="sm" onClick={updateDescription} disabled={isPending}>
                                Save
                            </Button>
                            <Button size="sm" variant="ghost" onClick={cancelEdit}>
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setIsEditing(true)}
                        >
                            <Edit className="size-3 text-muted-foreground" />
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};