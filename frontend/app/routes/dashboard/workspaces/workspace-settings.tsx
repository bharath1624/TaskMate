import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/loader";
import {
    useDeleteWorkspaceMutation,
    useGetWorkspaceDetailsQuery,
    useTransferWorkspaceOwnershipMutation,
    useUpdateWorkspaceMutation,
} from "@/hooks/use-workspace";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const WORKSPACE_COLORS = [
    { name: "orange", hex: "#FF6A3D" },
    { name: "blue", hex: "#38BDF8" },
    { name: "green", hex: "#22C55E" },
    { name: "yellow", hex: "#FACC15" },
    { name: "purple", hex: "#A855F7" },
    { name: "amber", hex: "#F97316" },
    { name: "teal", hex: "#2DD4BF" },
    { name: "slate", hex: "#334155" },
];

export default function WorkspaceSettingsPage() {
    const { workspaceId } = useParams();
    const { data: workspace, isLoading } =
        useGetWorkspaceDetailsQuery(workspaceId!);

    const updateWorkspace = useUpdateWorkspaceMutation();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [color, setColor] = useState("");
    const transferOwnership = useTransferWorkspaceOwnershipMutation();
    const [showMemberSelect, setShowMemberSelect] = useState(false);
    const [newOwnerId, setNewOwnerId] = useState("");
    const deleteWorkspace = useDeleteWorkspaceMutation();
    useEffect(() => {
        if (workspace) {
            setName(workspace.name);
            setDescription(workspace.description || "");
            setColor(workspace.color);
        }
    }, [workspace]);

    if (isLoading) return <Loader />;
    if (!workspace) return null;

    const handleSave = () => {
        updateWorkspace.mutate(
            {
                workspaceId: workspaceId!,
                payload: { name, description, color },
            },
            {
                onSuccess: () => {
                    toast.success("Saved changes successfully");
                },
                onError: () => {
                    toast.error("Failed to save changes");
                },
            }
        );
    };
    const isChanged =
        name !== workspace?.name ||
        description !== (workspace?.description || "") ||
        color !== workspace?.color;
    const isOwner =
        workspace?.owner?.toString() === workspace?.members?.find(
            (m) => m.role === "owner"
        )?.user?._id;

    return (
        <div className="flex justify-center pt-5">
            <div className="w-full max-w-3xl space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Workspace Settings</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Manage your workspace settings and preferences
                        </p>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        <div>
                            <label className="text-sm font-medium">Workspace Name</label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Workspace Color</label>
                            <div className="flex items-center gap-3 mt-2">
                                {WORKSPACE_COLORS.map((c) => (
                                    <button
                                        key={c.name}
                                        type="button"
                                        onClick={() => setColor(c.hex)}
                                        className={`
                      relative h-7 w-7 rounded-full
                      ${color === c.hex ? "ring-2 ring-offset-2 ring-blue-500" : ""}
                    `}
                                        style={{ backgroundColor: c.hex }}
                                    >
                                        {color === c.hex && (
                                            <span className="absolute inset-0 rounded-full border border-white/70" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                onClick={handleSave}
                                disabled={!isChanged || updateWorkspace.isPending}
                            >
                                Save Changes
                            </Button>

                        </div>
                    </CardContent>
                </Card>

                {isOwner && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Transfer Workspace</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Transfer ownership of this workspace to another member
                            </p>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {/* STEP 1 */}
                            {!showMemberSelect && (
                                <div className="flex justify-end">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="
    bg-slate-700
    text-white
    border-slate-700
    hover:bg-slate-800
    hover:border-slate-800
  "
                                            >
                                                Transfer Ownership
                                            </Button>
                                        </AlertDialogTrigger>

                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    Transfer workspace ownership?
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    You will lose owner privileges. This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>

                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => setShowMemberSelect(true)}
                                                >
                                                    Continue
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            )}

                            {/* STEP 2 */}
                            {showMemberSelect && (
                                <>
                                    <select
                                        className="w-full border rounded-md p-2"
                                        value={newOwnerId}
                                        onChange={(e) => setNewOwnerId(e.target.value)}
                                    >
                                        <option value="">Select new owner</option>
                                        {workspace.members
                                            .filter((m) => m.role !== "owner")
                                            .map((m) => (
                                                <option key={m.user._id} value={m.user._id}>
                                                    {m.user.name} ({m.user.email})
                                                </option>
                                            ))}
                                    </select>

                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            onClick={() => {
                                                setShowMemberSelect(false);
                                                setNewOwnerId("");
                                            }}
                                        >
                                            Cancel
                                        </Button>

                                        <Button
                                            variant="destructive"
                                            disabled={!newOwnerId || transferOwnership.isPending}
                                            onClick={() =>
                                                transferOwnership.mutate({
                                                    workspaceId: workspaceId!,
                                                    newOwnerId,
                                                })
                                            }
                                        >
                                            Confirm Transfer
                                        </Button>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                )}

                {isOwner && (
                    <Card className="border border-red-500 mb-5">
                        <CardHeader>
                            <CardTitle className="text-red-600">Danger Zone</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Irreversible actions for workspace
                            </p>
                        </CardHeader>

                        <CardContent className="flex justify-end">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">
                                        Delete Workspace
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Delete this workspace?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. All projects, tasks,
                                            and members will be permanently removed.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>

                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            className="bg-red-600 hover:bg-red-700"
                                            onClick={() => deleteWorkspace.mutate(workspaceId!)}
                                        >
                                            Delete Workspace
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
