import { Loader } from "@/components/loader";
import { NoDataFound } from "@/components/no-data-found";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateWorkspace } from "@/components/workspace/create-workspace";
import { WorkspaceAvatar } from "@/components/workspace/workspace-avatar";
import { useGetWorkspacesQuery } from "@/hooks/use-workspace";
import type { Workspace } from "@/types";
import { PlusCircle, Users, Lock } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { format } from "date-fns";
import { useAuth } from "@/provider/auth-context"; // ✅ Import useAuth

const Workspaces = () => {
    const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
    const { user } = useAuth(); // ✅ Get current user

    const { data: workspaces, isLoading } = useGetWorkspacesQuery() as {
        data: Workspace[];
        isLoading: boolean;
    };

    if (isLoading) {
        return <Loader />;
    }

    // 🔒 PERMISSION LOGIC: Define who can create a workspace
    // Adjust 'role' or 'email' check based on your User model
    const canCreateWorkspace = workspaces.some(ws =>
        ws.members?.some(
            m =>
                (m.user?._id || m.user) === user?._id &&
                m.role === "owner"
        )
    );
    return (
        <>
            <div className="space-y-8 pt-5">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl md:text-md font-bold">Manage and switch between your workspaces</h2>

                    {/* 🔒 Conditionally Render Create Button */}
                    {canCreateWorkspace ? (
                        <Button onClick={() => setIsCreatingWorkspace(true)}>
                            <PlusCircle className="size-4 mr-2" />
                            New Workspace
                        </Button>
                    ) : (
                        null
                    )}
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {workspaces.map((ws) => (
                        <WorkspaceCard key={ws._id} workspace={ws} />
                    ))}

                    {workspaces.length === 0 && (
                        <div className="col-span-full">
                            {canCreateWorkspace ? (
                                <NoDataFound
                                    title="No workspaces found"
                                    description="Create a new workspace to get started"
                                    buttonText="Create Workspace"
                                    buttonAction={() => setIsCreatingWorkspace(true)}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg border-dashed bg-muted/20">
                                    <Lock className="size-10 text-muted-foreground mb-4" />
                                    <h3 className="font-semibold text-lg">No Workspaces Found</h3>
                                    <p className="text-muted-foreground max-w-sm mt-2">
                                        You don't have any workspaces yet, and you don't have permission to create one. Please contact your administrator.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Only render the dialog logic if allowed (extra safety) */}
            {canCreateWorkspace && (
                <CreateWorkspace
                    isCreatingWorkspace={isCreatingWorkspace}
                    setIsCreatingWorkspace={setIsCreatingWorkspace}
                />
            )}
        </>
    );
}

const WorkspaceCard = ({ workspace }: { workspace: Workspace }) => {
    return (
        <Link to={`/workspaces/${workspace._id}`}>
            <Card className="transition-all hover:shadow-md hover:-translate-y-1">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                            <WorkspaceAvatar name={workspace.name} color={workspace.color} />

                            <div>
                                <CardTitle>{workspace.name}</CardTitle>
                                <span className="text-xs text-muted-foreground">
                                    Created on {format(new Date(workspace.createdAt), "MMM d, yyyy h:mm a")}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center text-muted-foreground">
                            <Users className="size-4 mr-1" />
                            <span className="text-xs">{workspace.members?.length || 0}</span>
                        </div>
                    </div>

                    <CardDescription>
                        {workspace.description || "No description"}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="text-sm text-muted-foreground">
                        View workspace details
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
};

export default Workspaces;