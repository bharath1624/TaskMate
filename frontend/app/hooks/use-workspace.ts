import type { WorkspaceForm } from "@/components/workspace/create-workspace";
import { fetchData, postData } from "@/lib/fetch-util";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useCreateWorkspace = () => {
    return useMutation({
        mutationFn: async (data: WorkspaceForm) => postData("/workspaces", data),
    });
};

export const useGetWorkspacesQuery = () => {
    return useQuery({
        queryKey: ["workspaces"],
        queryFn: async () => fetchData("/workspaces"),
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
    return useQuery({
        queryKey: ["workspace", workspaceId, "details"],
        queryFn: async () => fetchData(`/workspaces/${workspaceId}`),
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