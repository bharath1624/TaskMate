import type { TaskPriority } from "@/types";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { useUpdateTaskPriorityMutation } from "@/hooks/use-task";
import { toast } from "sonner";

export const TaskPrioritySelector = ({
    priority,
    taskId,
    canEdit, // 🔒 Received Prop
}: {
    priority: TaskPriority;
    taskId: string;
    canEdit: boolean;
}) => {
    const { mutate, isPending } = useUpdateTaskPriorityMutation();

    const handleStatusChange = (value: string) => {
        mutate(
            { taskId, priority: value as TaskPriority },
            {
                onSuccess: () => {
                    toast.success("Priority updated successfully");
                },
                onError: (error: any) => {
                    const errorMessage = error.response.data.message;
                    toast.error(errorMessage);
                },
            }
        );
    };
    return (
        <Select
            value={priority || ""}
            onValueChange={handleStatusChange}
            disabled={isPending || !canEdit} // 🔒 Lock it
        >
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Priority" />
            </SelectTrigger>

            <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
            </SelectContent>
        </Select>
    );
};