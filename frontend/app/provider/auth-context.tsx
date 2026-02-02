import type { User } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";
import { queryClient } from "./react-query-provider";
import { useNavigate, useLocation } from "react-router";
import { publicRoutes } from "@/lib";
import { api } from "@/lib/fetch-util";

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: any) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();

    const normalizeUser = (user: User): User => {
        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

        return {
            ...user,
            profilePicture: user.profilePicture
                ? user.profilePicture.startsWith("http")
                    ? user.profilePicture
                    : `${BACKEND_URL}${user.profilePicture}`
                : "",
        };
    };


    // 1️⃣ Initial auth check
    useEffect(() => {
        const checkAuth = async () => {
            setIsLoading(true);

            try {
                const storedUser = localStorage.getItem("user");
                const path = window.location.pathname; // 🔥 REAL path
                const isPublicRoute = publicRoutes.includes(path);

                if (storedUser) {
                    setUser(normalizeUser(JSON.parse(storedUser)));
                    setIsAuthenticated(true);
                } else {
                    setUser(null);
                    setIsAuthenticated(false);

                    if (!isPublicRoute) {
                        navigate("/sign-in", { replace: true });
                    }
                }
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);
    // frontend/src/context/auth-provider.tsx (Replace your 4th useEffect)

    // 4️⃣ AUTO-ACCEPT WORKSPACE INVITE AFTER LOGIN
    useEffect(() => {
        const acceptInviteAfterLogin = async () => {
            const inviteToken = localStorage.getItem("inviteToken");
            const storedToken = localStorage.getItem("token");

            // Only run if we have BOTH an invite and a session token
            if (!inviteToken || !storedToken) return;

            try {
                // FORCE the header here too
                const res = await api.post(
                    "/workspaces/accept-invite-token",
                    { token: inviteToken },
                    {
                        headers: {
                            Authorization: `Bearer ${storedToken}`,
                        },
                    }
                );

                if (res.data.joined && res.data.workspaceId) {
                    localStorage.removeItem("inviteToken");

                    // Refresh workspace list
                    await queryClient.invalidateQueries({ queryKey: ["workspaces"] });

                    // Navigate to the joined workspace
                    navigate(`/dashboard/workspaces/${res.data.workspaceId}`, { replace: true });
                }
            } catch (error) {
                console.error("Auto invite accept failed", error);
            }
        };

        // Run this whenever the user becomes authenticated
        if (isAuthenticated) {
            acceptInviteAfterLogin();
        }
    }, [isAuthenticated, navigate]);


    // 2️⃣ FORCED logout ONLY (401 / token expired)
    useEffect(() => {
        const handleForceLogout = async () => {
            await logout();
            navigate("/sign-in", { replace: true });
        };

        window.addEventListener("force-logout", handleForceLogout);
        return () =>
            window.removeEventListener("force-logout", handleForceLogout);
    }, []);

    // 3️⃣ User update listener (OK)
    useEffect(() => {
        const handleUserUpdate = () => {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                setUser(normalizeUser(JSON.parse(storedUser)));
            }
        };

        window.addEventListener("user-updated", handleUserUpdate);
        return () =>
            window.removeEventListener("user-updated", handleUserUpdate);
    }, []);

    const login = async (data: any) => {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setUser(normalizeUser(data.user));
        setIsAuthenticated(true);

        // 🔥 FIX-4: FORCE workspace + sidebar refresh
        queryClient.invalidateQueries({ queryKey: ["workspaces"] });
        queryClient.refetchQueries({ queryKey: ["workspaces"] });
    };



    const logout = async () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);
        setIsAuthenticated(false);

        queryClient.clear();
    };
    const values = {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
    };
    return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};