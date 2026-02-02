import type { CreateProjectFormData } from "@/components/project/create-project";
import { deleteData, fetchData, patchData, postData } from "@/lib/fetch-util";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

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
            //toast.success("Project created successfully");
            queryClient.invalidateQueries({
                queryKey: ["workspace", data.workspace],
            });
            queryClient.invalidateQueries({
                queryKey: ["workspaces"],
            });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to create project");
        }
    });
};

export const UseProjectQuery = (projectId: string) => {
    // ❌ Removed useNavigate here to prevent forced redirect loops
    return useQuery({
        queryKey: ["project", projectId],
        queryFn: async () => {
            try {
                return await fetchData(`/projects/${projectId}/tasks`);
            } catch (error: any) {
                // 🛡️ HANDLE 404 SILENTLY
                // If project is deleted, don't crash or redirect blindly. 
                // Just return null so the UI can handle the empty state gracefully.
                if (error.response?.status === 404) {
                    return null;
                }
                throw error;
            }
        },
        retry: false,
        refetchOnWindowFocus: false,
        enabled: !!projectId,
        refetchInterval: 1000,
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
                startDate?: string | null;
                dueDate?: string | null;
                members?: string[];
            };
        }) => {
            return patchData(`/projects/${projectId}`, payload);
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["project", variables.projectId],
            });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update project");
        }
    });
};

export const UseDeleteProject = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const params = useParams(); // ✅ Get current workspaceId from URL

    return useMutation({
        mutationFn: async ({ projectId }: { projectId: string }) => {
            return deleteData(`/projects/${projectId}`);
        },
        onSuccess: (_data, variables) => {
            // 1. Kill the active project query instantly to stop 404s
            queryClient.removeQueries({
                queryKey: ["project", variables.projectId],
                exact: true,
            });

            // 2. Kill tasks query
            queryClient.removeQueries({
                queryKey: ["project-tasks", variables.projectId],
            });

            // 3. Refresh workspace lists
            queryClient.invalidateQueries({ queryKey: ["workspaces"] });

            // 4. Navigate Correctly
            //toast.success("Project deleted successfully");

            // ✅ Redirect to the specific Workspace Page, not the empty Dashboard
            if (params.workspaceId) {
                navigate(`/workspaces/${params.workspaceId}`, { replace: true });
            } else {
                navigate("/dashboard");
            }
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to delete project");
        }
    });
};

export const UseToggleArchiveProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ projectId }: { projectId: string }) => {
            return patchData(`/projects/${projectId}/archive`, {});
        },
        // 👇 FIX: Add ': any' here to tell TypeScript it has properties like .message and .project
        onSuccess: (data: any) => {
            toast.success(data.message);

            // 1. Update the specific project details (Settings page)
            queryClient.invalidateQueries({ queryKey: ["project", data.project._id] });

            // 2. CRITICAL: Force the Archived Page to reload
            queryClient.invalidateQueries({ queryKey: ["archived-data"] });

            // 3. Update the Sidebar/Dashboard list (to remove/add the project)
            queryClient.invalidateQueries({ queryKey: ["workspaces"] });
            queryClient.invalidateQueries({ queryKey: ["workspace"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update archive status");
        }
    });
};