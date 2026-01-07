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


    useEffect(() => {
        const checkAuth = async () => {
            setIsLoading(true);
            try {
                const storedUser = localStorage.getItem("user");

                if (storedUser) {
                    setUser(normalizeUser(JSON.parse(storedUser))); // ✅ HERE
                    setIsAuthenticated(true);
                } else {
                    setUser(null);
                    setIsAuthenticated(false);
                    if (!isPublicRoute) {
                        navigate("/sign-in");
                    }
                }
            } catch (error) {
                console.error("Auth check failed:", error);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);


    useEffect(() => {
        const handleLogout = () => {
            logout();
            navigate("/sign-in");
        };
        window.addEventListener("force-logout", handleLogout);
        return () => window.removeEventListener("force-logout", handleLogout);
    }, []);
    useEffect(() => {
        const handleUserUpdate = () => {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                setUser(normalizeUser(JSON.parse(storedUser)));
            }
        };

        window.addEventListener("user-updated", handleUserUpdate);
        return () => window.removeEventListener("user-updated", handleUserUpdate);
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