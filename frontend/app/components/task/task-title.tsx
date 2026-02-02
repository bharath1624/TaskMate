import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Edit } from "lucide-react";
import { useUpdateTaskTitleMutation } from "@/hooks/use-task";
import { toast } from "sonner";

export const TaskTitle = ({ title, taskId, canEdit }: any) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newTitle, setNewTitle] = useState(title);
    const { mutate, isPending } = useUpdateTaskTitleMutation();

    const updateTitle = () => {
        mutate(
            { taskId, title: newTitle },
            {
                onSuccess: () => {
                    setIsEditing(false);
                    toast.success("Title updated successfully");
                },
            }
        );
    };

    const cancelEdit = () => {
        setNewTitle(title);
        setIsEditing(false);
    };

    return (
        <div className="grid grid-cols-[1fr_auto] gap-3 items-center">
            <div className="min-h-10 flex items-center">
                {isEditing ? (
                    <Input
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="text-xl font-semibold"
                        disabled={isPending}
                    />
                ) : (
                    <h2 className="text-xl font-semibold">{title}</h2>
                )}
            </div>

            {canEdit && (
                <div className="flex items-center gap-2 shrink-0">
                    {isEditing ? (
                        <>
                            <Button size="sm" onClick={updateTitle} disabled={isPending}>
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