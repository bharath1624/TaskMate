import { Header } from '@/components/layout/header';
import { SidebarComponent } from '@/components/layout/sidebar-component';
import { Loader } from '@/components/loader';
import { CreateWorkspace } from '@/components/workspace/create-workspace';
import { fetchData } from '@/lib/fetch-util';
import { useAuth } from '@/provider/auth-context';
import type { Workspace } from '@/types';
import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLoaderData, useNavigate, useLocation } from 'react-router';

export const clientLoader = async () => {
    const workspaces = await fetchData("/workspaces");
    return { workspaces };
};

const DashboardLayout = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const { workspaces } = useLoaderData() as { workspaces: Workspace[] };
    const navigate = useNavigate();

    const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
    const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);

    const location = useLocation();

    useEffect(() => {
        if (workspaces?.length > 0 && !currentWorkspace) {
            const params = new URLSearchParams(window.location.search);
            const workspaceIdFromUrl = params.get("workspaceId");

            const foundWorkspace = workspaces.find(
                (ws) => ws._id === workspaceIdFromUrl
            );

            const workspaceToSet = foundWorkspace || workspaces[0];

            setCurrentWorkspace(workspaceToSet);

            // ✅ ONLY redirect if user is on dashboard
            if (location.pathname === "/dashboard") {
                navigate(`/dashboard?workspaceId=${workspaceToSet._id}`, {
                    replace: true,
                });
            }
        }
    }, [workspaces, location.pathname]);



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
