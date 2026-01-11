import { Header } from '@/components/layout/header';
import { SidebarComponent } from '@/components/layout/sidebar-component';
import { Loader } from '@/components/loader';
import { CreateWorkspace } from '@/components/workspace/create-workspace';
import { useGetWorkspacesQuery } from '@/hooks/use-workspace';
import { fetchData } from '@/lib/fetch-util';
import { useAuth } from '@/provider/auth-context';
import type { Workspace } from '@/types';
import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLoaderData, useNavigate, useLocation } from 'react-router';


const DashboardLayout = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();

    const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
    const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
    const { data: workspaces = [], isLoading: isWorkspacesLoading } =
        useGetWorkspacesQuery();

    const location = useLocation();

    useEffect(() => {
        if (!workspaces.length) return;

        const params = new URLSearchParams(window.location.search);
        const workspaceIdFromUrl = params.get("workspaceId");

        const updatedWorkspace =
            workspaces.find((ws) => ws._id === workspaceIdFromUrl) ||
            workspaces.find((ws) => ws._id === currentWorkspace?._id) ||
            workspaces[0];

        setCurrentWorkspace(updatedWorkspace);

        if (location.pathname === "/dashboard") {
            navigate(`/dashboard?workspaceId=${updatedWorkspace._id}`, {
                replace: true,
            });
        }
    }, [workspaces]);



    if (isLoading) return <Loader />;
    if (!isAuthenticated) return <Navigate to="/sign-in" />;

    const handleWorkspaceSelected = (workspace: Workspace) => {
        setCurrentWorkspace(workspace);
        navigate(`/dashboard?workspaceId=${workspace._id}`);
    };

    return (
        <div className="flex h-screen w-full">
            <SidebarComponent currentWorkspace={currentWorkspace} />

            <div className="flex flex-1 flex-col h-full">
                <Header
                    workspaces={workspaces}   // ✅ THIS WAS MISSING
                    onWorkspaceSelected={handleWorkspaceSelected}
                    selectedWorkspace={currentWorkspace}
                    onCreateWorkspace={() => setIsCreatingWorkspace(true)}
                />


                <main className="flex-1 overflow-y-auto">
                    <div className="container mx-auto px-2 sm:px-6 lg:px-8">
                        <Outlet />
                    </div>
                </main>
            </div>

            <CreateWorkspace
                isCreatingWorkspace={isCreatingWorkspace}
                setIsCreatingWorkspace={setIsCreatingWorkspace}
            />
        </div>
    );
};

export default DashboardLayout;