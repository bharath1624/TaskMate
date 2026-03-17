import { useAuth } from '@/provider/auth-context';
import React from 'react';
import { Navigate, Outlet } from 'react-router';
import { Layout, Loader2 } from 'lucide-react';

const AuthLayout = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background relative overflow-hidden">
                {/* Ambient Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative flex flex-col items-center z-10 animate-in fade-in duration-500">
                    {/* Animated Logo Container */}
                    <div className="relative w-24 h-24 flex items-center justify-center mb-6">
                        {/* Spinning outer rings */}
                        <div className="absolute inset-0 rounded-2xl border-t-2 border-r-2 border-blue-600/80 animate-[spin_2s_linear_infinite]" />
                        <div className="absolute inset-1.5 rounded-2xl border-b-2 border-l-2 border-indigo-500/80 animate-[spin_3s_linear_infinite_reverse]" />

                        {/* Central Logo */}
                        <div className="relative w-14 h-14 bg-linear-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                            <Layout className="size-7 text-white animate-pulse" />
                        </div>
                    </div>

                    {/* Text Content */}
                    <h2 className="text-2xl font-bold tracking-tight text-foreground mb-3">
                        TaskMate
                    </h2>
                    <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 px-4 py-2 rounded-full border border-border/50">
                        <Loader2 className="size-4 animate-spin text-blue-600" />
                        <span className="text-sm font-medium">Preparing workspace...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" />;
    }

    return <Outlet />;
}

export default AuthLayout;