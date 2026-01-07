import { api, fetchData, updateData } from "@/lib/fetch-util";
import { useMutation, useQueryClient } from "@tanstack/react-query";


import type {
    ChangePasswordFormData,
    ProfileFormData,
} from "@/routes/user/profile";
import { useQuery, type QueryKey } from "@tanstack/react-query";

const queryKey: QueryKey = ["user"];

export const useUserProfileQuery = () => {
    return useQuery({
        queryKey,
        queryFn: () => fetchData("/users/profile"),
    });
};

export const useChangePassword = () => {
    return useMutation({
        mutationFn: (data: ChangePasswordFormData) =>
            updateData("/users/change-password", data),
    });
};

export const useUpdateUserProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData: FormData) => {
            const res = await api.put("/users/profile", formData);
            return res.data.user; // IMPORTANT
        },
        onSuccess: (updatedUser) => {
            localStorage.setItem("user", JSON.stringify(updatedUser));
            window.dispatchEvent(new Event("user-updated"));

            queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        }
    });
};



