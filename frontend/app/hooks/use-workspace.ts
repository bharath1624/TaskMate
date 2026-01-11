import type { WorkspaceForm } from "@/components/workspace/create-workspace";
import { deleteData, fetchData, patchData, postData, updateData } from "@/lib/fetch-util";
import type { Workspace } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

export const useCreateWorkspace = () => {
    return useMutation({
        mutationFn: async (data: WorkspaceForm) => postData("/workspaces", data),
    });
};

export const useGetWorkspacesQuery = () => {
    return useQuery<Workspace[]>({
        queryKey: ["workspaces"],
        queryFn: async () => fetchData<Workspace[]>("/workspaces"),
    });
};

export const useGetWorkspaceQuery = (workspaceId: string) => {
    return useQuery({
        queryKey: ["workspace", workspaceId],
        queryFn: async () => fetchData(`/workspaces/${workspaceId}/projects`),
    });
};

export const useGetWorkspaceStatsQuery = (
    workspaceId: string | null
) => {
    return useQuery({
        queryKey: ["workspace", workspaceId, "stats"],
        queryFn: async () => {
            if (!workspaceId) {
                throw new Error("Workspace ID is missing");
            }
            return fetchData(`/workspaces/${workspaceId}/stats`);
        },
        enabled: !!workspaceId, // 🔥 KEY FIX
    });
};

export const useGetWorkspaceDetailsQuery = (workspaceId: string) => {
    return useQuery<Workspace>({
        queryKey: ["workspace", workspaceId, "details"],
        queryFn: async () =>
            fetchData<Workspace>(`/workspaces/${workspaceId}`),
        enabled: !!workspaceId,
    });
};


export const useGetArchivedDataQuery = (workspaceId: string) => {
    return useQuery({
        queryKey: ["archived", workspaceId],
        queryFn: () =>
            fetchData(`/workspaces/${workspaceId}/archived`),
        enabled: !!workspaceId,
    });
};

export const useInviteMemberMutation = () => {
    return useMutation({
        mutationFn: (data: { email: string; role: string; workspaceId: string }) =>
            postData(`/workspaces/${data.workspaceId}/invite-member`, data),
    });
};

export const useAcceptInviteByTokenMutation = () => {
    return useMutation({
        mutationFn: (token: string) =>
            postData(`/workspaces/accept-invite-token`, {
                token,
            }),
    });
};

export const useAcceptGenerateInviteMutation = () => {
    return useMutation({
        mutationFn: (workspaceId: string) =>
            postData(`/workspaces/${workspaceId}/accept-generate-invite`, {}),
    });
};

export const useUpdateWorkspaceMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: {
            workspaceId: string;
            payload: {
                name?: string;
                description?: string;
                color?: string;
            };
        }) =>
            updateData(`/workspaces/${data.workspaceId}`, data.payload),

        onSuccess: (_, variables) => {
            // ✅ refresh workspace list (dropdown, cards, header source)
            queryClient.invalidateQueries({
                queryKey: ["workspaces"],
            });

            // ✅ refresh workspace details (settings page)
            queryClient.invalidateQueries({
                queryKey: ["workspace", variables.workspaceId, "details"],
            });
        },
    });
};

export const useTransferWorkspaceOwnershipMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: {
            workspaceId: string;
            newOwnerId: string;
        }) =>
            updateData(
                `/workspaces/${data.workspaceId}/transfer-ownership`,
                { newOwnerId: data.newOwnerId }
            ),

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["workspaces"] });
            queryClient.invalidateQueries({
                queryKey: ["workspace", variables.workspaceId, "details"],
            });
        },
    });
};
export const useDeleteWorkspaceMutation = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: (workspaceId: string) =>
            deleteData(`/workspaces/${workspaceId}`),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workspaces"] });
            navigate("/workspaces");
        },

    });
};
