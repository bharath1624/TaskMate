import type { User } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";
import { queryClient } from "./react-query-provider";
import { useNavigate, useLocation } from "react-router";
import { publicRoutes } from "@/lib";

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
    const currentPath = useLocation().pathname;
    const isPublicRoute = publicRoutes.includes(currentPath);

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

                if (storedUser) {
                    setUser(normalizeUser(JSON.parse(storedUser)));
                    setIsAuthenticated(true);
                } else {
                    setUser(null);
                    setIsAuthenticated(false);
                    if (!isPublicRoute) {
                        navigate("/sign-in");
                    }
                }
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

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