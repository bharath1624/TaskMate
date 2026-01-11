import type { CreateProjectFormData } from "@/components/project/create-project";
import { deleteData, fetchData, patchData, postData } from "@/lib/fetch-util";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const UseCreateProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            projectData: CreateProjectFormData;
            workspaceId: string;
        }) =>
            postData(
                `/projects/${data.workspaceId}/create-project`,
                data.projectData
            ),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({
                queryKey: ["workspace", data.workspace],
            });
        },
    });
};

export const UseProjectQuery = (projectId: string) => {
    return useQuery({
        queryKey: ["project", projectId],
        queryFn: () => fetchData(`/projects/${projectId}/tasks`),
        retry: false,               // ❌ no retry on 404
        refetchOnWindowFocus: false,
        enabled: !!projectId,       // safety
    });
};

export const UseUpdateProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            projectId,
            payload,
        }: {
            projectId: string;
            payload: {
                title: string;
                description?: string;
                status?: string;
                tags?: string[];
            };
        }) => {
            return patchData(`/projects/${projectId}`, payload);
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["project", variables.projectId],
            });
        },
    });
};

export const UseDeleteProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ projectId }: { projectId: string }) => {
            return deleteData(`/projects/${projectId}`);
        },
        onSuccess: (_data, variables) => {
            // 🔥 Kill project query immediately
            queryClient.removeQueries({
                queryKey: ["project", variables.projectId],
                exact: true,
            });

            // 🔥 Kill project tasks query (IMPORTANT)
            queryClient.removeQueries({
                queryKey: ["project-tasks", variables.projectId],
            });

            // Refresh workspace list
            queryClient.invalidateQueries({
                queryKey: ["workspaces"],
            });
        }

    });
};

