import type { CreateTaskFormData } from "@/components/task/create-task-dialog";
import { deleteData, fetchData, postData, updateData } from "@/lib/fetch-util";
import type { TaskPriority, TaskStatus } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCreateTaskMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { projectId: string; taskData: CreateTaskFormData }) =>
            postData(`/tasks/${data.projectId}/create-task`, data.taskData),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({
                queryKey: ["project", data.project],
            });
        },
    });
};

export const useTaskByIdQuery = (taskId: string) => {
    return useQuery({
        queryKey: ["task", taskId],
        queryFn: () => fetchData(`/tasks/${taskId}`),
    });
};

export const useUpdateTaskTitleMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { taskId: string; title: string }) =>
            updateData(`/tasks/${data.taskId}/title`, { title: data.title }),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({
                queryKey: ["task", data._id],
            });
            queryClient.invalidateQueries({
                queryKey: ["task-activity", data._id],
            });
        },
    });
};

export const useUpdateTaskStatusMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { taskId: string; status: TaskStatus }) =>
            updateData(`/tasks/${data.taskId}/status`, {
                status: data.status,
            }),

        onSuccess: (data: any) => {
            // refresh task detail
            queryClient.invalidateQueries({
                queryKey: ["task", data._id],
            });

            // refresh task activity
            queryClient.invalidateQueries({
                queryKey: ["task-activity", data._id],
            });

            // 🔥 THIS IS THE IMPORTANT PART
            queryClient.invalidateQueries({
                queryKey: ["project", data.project],
            });
        },
    });
};

export const useUpdateTaskDescriptionMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { taskId: string; description: string }) =>
            updateData(`/tasks/${data.taskId}/description`, {
                description: data.description,
            }),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({
                queryKey: ["task", data._id],
            });
            queryClient.invalidateQueries({
                queryKey: ["task-activity", data._id],
            });
        },
    });
};

export const useUpdateTaskAssigneesMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { taskId: string; assignees: string[] }) =>
            updateData(`/tasks/${data.taskId}/assignees`, {
                assignees: data.assignees,
            }),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({
                queryKey: ["task", data._id],
            });
            queryClient.invalidateQueries({
                queryKey: ["task-activity", data._id],
            });
        },
    });
};

export const useUpdateTaskPriorityMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { taskId: string; priority: TaskPriority }) =>
            updateData(`/tasks/${data.taskId}/priority`, { priority: data.priority }),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({
                queryKey: ["task", data._id],
            });
            queryClient.invalidateQueries({
                queryKey: ["task-activity", data._id],
            });
        },
    });
};

export const useAddSubTaskMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { taskId: string; title: string }) =>
            postData(`/tasks/${data.taskId}/add-subtask`, { title: data.title }),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({
                queryKey: ["task", data._id],
            });
            queryClient.invalidateQueries({
                queryKey: ["task-activity", data._id],
            });
        },
    });
};

export const useUpdateSubTaskMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: {
            taskId: string;
            subTaskId: string;
            completed: boolean;
        }) =>
            updateData(`/tasks/${data.taskId}/update-subtask/${data.subTaskId}`, {
                completed: data.completed,
            }),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({
                queryKey: ["task", data._id],
            });
            queryClient.invalidateQueries({
                queryKey: ["task-activity", data._id],
            });
        },
    });
};

export const useAddCommentMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { taskId: string; text: string }) =>
            postData(`/tasks/${data.taskId}/add-comment`, { text: data.text }),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({
                queryKey: ["comments", data.task],
            });
            queryClient.invalidateQueries({
                queryKey: ["task-activity", data.task],
            });
        },
    });
};

export const useGetCommentsByTaskIdQuery = (taskId: string) => {
    return useQuery({
        queryKey: ["comments", taskId],
        queryFn: () => fetchData(`/tasks/${taskId}/comments`),
    });
};

export const useWatchTaskMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { taskId: string }) =>
            postData(`/tasks/${data.taskId}/watch`, {}),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({
                queryKey: ["task", data._id],
            });
            queryClient.invalidateQueries({
                queryKey: ["task-activity", data._id],
            });
        },
    });
};

export const useAchievedTaskMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { taskId: string }) =>
            postData(`/tasks/${data.taskId}/achieved`, {}), // Ensure this matches your route (is it 'archive' or 'achieved'?)

        onSuccess: (data: any) => {
            // 1. Refresh Task Details
            queryClient.invalidateQueries({
                queryKey: ["task", data._id],
            });

            // 2. Refresh Activity Log
            queryClient.invalidateQueries({
                queryKey: ["task-activity", data._id],
            });

            // 3. 👇 CRITICAL: Force the Archived Page to reload
            queryClient.invalidateQueries({
                queryKey: ["archived-data"],
            });

            // 4. Update Project Board (to remove the task from the board view)
            queryClient.invalidateQueries({
                queryKey: ["project", data.project],
            });
        },
    });
};
// ✅ Make sure workspaceId is accepted as a parameter
export const useGetMyTasksQuery = (workspaceId?: string | null) => {
    return useQuery({
        // Add workspaceId to the query key so it triggers a refetch when changed
        queryKey: ["my-tasks", workspaceId],
        // ✅ Add the query string to the URL!
        queryFn: () => fetchData(`/tasks/my-tasks?workspaceId=${workspaceId}`),
        // ✅ Prevent it from running if workspaceId is missing or undefined
        enabled: !!workspaceId,
    });
};

export const useDeleteTaskMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ taskId }: { taskId: string }) =>
            deleteData(`/tasks/${taskId}`),

        onSuccess: (data: any) => {
            queryClient.invalidateQueries({
                queryKey: ["project", data.project],
            });
        },
    });
};

export const useAddTaskAttachmentMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: {
            taskId: string;
            formData: FormData;
        }) =>
            postData(
                `/tasks/${data.taskId}/attachments`,
                data.formData
            ),

        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["task", variables.taskId],
            });
        }
    });
};

export const useDeleteTaskAttachmentMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: {
            taskId: string;
            attachmentId: string;
        }) =>
            deleteData(
                `/tasks/${data.taskId}/attachments/${data.attachmentId}`
            ),

        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["task", variables.taskId],
            });
            queryClient.invalidateQueries({
                queryKey: ["task-activity", variables.taskId],
            });
        },
    });
};

export const useMarkCommentsReadMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        // This calls the API we just created
        mutationFn: (taskId: string) => updateData(`/tasks/${taskId}/read`, {}),
        onSuccess: (_, taskId) => {
            // Refetch comments to update the UI
            queryClient.invalidateQueries({ queryKey: ["comments", taskId] });
        },
    });
};
export const useGetWorkspaceTasksQuery = (workspaceId: string | undefined) => {
    return useQuery({
        queryKey: ["workspace-tasks", workspaceId],
        queryFn: () => fetchData(`/workspaces/${workspaceId}/tasks`),
        enabled: !!workspaceId, // Only runs when workspaceId exists
    });
};
