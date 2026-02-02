import type { TaskStatus } from "@/types";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { useUpdateTaskStatusMutation } from "@/hooks/use-task";
import { toast } from "sonner";

export const TaskStatusSelector = ({
    status,
    taskId,
    canEdit, // 🔒 1. Add this prop
}: {
    status: TaskStatus;
    taskId: string;
    canEdit: boolean; // 🔒 2. Define type
}) => {
    const { mutate, isPending } = useUpdateTaskStatusMutation();

    const handleStatusChange = (value: string) => {
        mutate(
            { taskId, status: value as TaskStatus },
            {
                onSuccess: () => {
                    toast.success("Status updated successfully");
                },
                onError: (error: any) => {
                    const errorMessage = error.response.data.message;
                    toast.error(errorMessage);
                    console.log(error);
                },
            }
        );
    };

    return (
        <Select
            value={status || ""}
            onValueChange={handleStatusChange}
            // 🔒 3. Disable if pending OR if user doesn't have permission
            disabled={isPending || !canEdit}
        >
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
            </SelectTrigger>

            <SelectContent>
                <SelectItem value="To Do">To Do</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Done">Done</SelectItem>
            </SelectContent>
        </Select>
    );
};