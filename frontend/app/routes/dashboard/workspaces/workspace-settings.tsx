import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/provider/auth-context"; // Import Auth for permission check
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2, Plus } from "lucide-react";
import { api } from "@/lib/fetch-util"; // Assuming you have an API util for the raw invite call
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
    const { user } = useAuth(); // Get current logged-in user
    const queryClient = useQueryClient();

    const { data: workspace, isLoading } = useGetWorkspaceDetailsQuery(workspaceId!);

    // Mutations
    const updateWorkspace = useUpdateWorkspaceMutation();
    const deleteWorkspace = useDeleteWorkspaceMutation();
    const transferOwnership = useTransferWorkspaceOwnershipMutation();

    // Invite Member Mutation
    const inviteMemberMutation = useMutation({
        mutationFn: async (data: { email: string; role: string }) => {
            return await api.post(`/workspaces/${workspaceId}/invite-member`, data);
        },
        onSuccess: () => {
            toast.success("Invitation sent successfully");
            setInviteEmail("");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to send invitation");
        },
    });

    // Remove Member Mutation (Placeholder - You need to add this endpoint to backend)
    const removeMemberMutation = useMutation({
        mutationFn: async (memberId: string) => {
            // This matches the new route we just created
            const res = await api.delete(
                `/workspaces/${workspaceId}/members/${memberId}`
            );
            return res.data;
        },
        onSuccess: () => {
            toast.success("Member removed successfully");
            // Refetch workspace data to update the list immediately
            queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to remove member");
        }
    });
    // State
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [color, setColor] = useState("");

    // Transfer State
    const [showMemberSelect, setShowMemberSelect] = useState(false);
    const [newOwnerId, setNewOwnerId] = useState("");

    // Invite State
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("member");

    useEffect(() => {
        if (workspace) {
            setName(workspace.name);
            setDescription(workspace.description || "");
            setColor(workspace.color);
        }
    }, [workspace]);

    if (isLoading) return <Loader />;
    if (!workspace) return null;

    // ✅ Correct permission check: compare workspace owner ID with current user ID
    const isOwner = workspace.owner === user?._id;

    const handleSave = () => {
        updateWorkspace.mutate(
            {
                workspaceId: workspaceId!,
                payload: { name, description, color },
            },
            {
                onSuccess: () => toast.success("Saved changes successfully"),
                onError: () => toast.error("Failed to save changes"),
            }
        );
    };

    const handleInvite = () => {
        if (!inviteEmail) return;
        inviteMemberMutation.mutate({ email: inviteEmail, role: inviteRole });
    };

    const isChanged =
        name !== workspace?.name ||
        description !== (workspace?.description || "") ||
        color !== workspace?.color;

    const getImageUrl = (path?: string) => {
        if (!path) return undefined;
        if (path.startsWith("http")) return path;
        return `http://localhost:5000${path.startsWith("/") ? path : `/${path}`}`;
    };


    return (
        <div className="flex justify-center pt-5 pb-10">
            <div className="w-full max-w-3xl space-y-6">

                {/* 1. GENERAL SETTINGS CARD */}
                <Card>
                    <CardHeader>
                        <CardTitle>Workspace Settings</CardTitle>
                        <CardDescription>
                            Manage your workspace details and appearance
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Workspace Name</label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={!isOwner}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={!isOwner}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Workspace Color</label>
                            <div className="flex items-center gap-3 mt-2">
                                {WORKSPACE_COLORS.map((c) => (
                                    <button
                                        key={c.name}
                                        type="button"
                                        disabled={!isOwner}
                                        onClick={() => setColor(c.hex)}
                                        className={`
                                            relative h-7 w-7 rounded-full transition-all
                                            ${color === c.hex ? "ring-2 ring-offset-2 ring-blue-500 scale-110" : ""}
                                            ${!isOwner ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}
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

                        {isOwner && (
                            <div className="flex justify-end">
                                <Button
                                    onClick={handleSave}
                                    disabled={!isChanged || updateWorkspace.isPending}
                                >
                                    {updateWorkspace.isPending ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 2. MEMBERS MANAGEMENT CARD (NEW) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Workspace Members</CardTitle>
                        <CardDescription>
                            Manage access and roles for this workspace
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        {/* INVITE FORM (Only for Owner) */}
                        {isOwner && (
                            <div className="flex flex-col sm:flex-row gap-3 items-end border-b pb-6">
                                <div className="flex-1 space-y-1 w-full">
                                    <label className="text-sm font-medium">Invite new member</label>
                                    <Input
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                    />
                                </div>
                                <div className="w-full sm:w-[140px] space-y-1">
                                    <label className="text-sm font-medium">Role</label>
                                    <Select value={inviteRole} onValueChange={setInviteRole}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="member">Member</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="viewer">Viewer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    onClick={handleInvite}
                                    disabled={!inviteEmail || inviteMemberMutation.isPending}
                                    className="w-full sm:w-auto"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    {inviteMemberMutation.isPending ? "Sending..." : "Invite"}
                                </Button>
                            </div>
                        )}

                        {/* MEMBERS LIST */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Current Members</h3>
                            {workspace.members.map((member: any) => (
                                <div key={member.user._id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={getImageUrl(member.user.profilePicture)} />
                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                {member.user.name?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium leading-none">{member.user.name}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{member.user.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="px-2 py-1 text-xs font-medium rounded-full bg-secondary capitalize">
                                            {member.role}
                                        </div>

                                        {/* Remove Button: Only Owner can see, cannot remove self */}
                                        {isOwner && member.user._id !== user?._id && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-muted-foreground hover:text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Remove member?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to remove <b>{member.user.name}</b> from the workspace?
                                                            They will lose access to all projects and tasks.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            className="bg-red-600 hover:bg-red-700"
                                                            onClick={() => removeMemberMutation.mutate(member.user._id)}
                                                        >
                                                            Remove
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* 3. TRANSFER OWNERSHIP CARD */}
                {isOwner && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Transfer Workspace</CardTitle>
                            <CardDescription>
                                Transfer ownership of this workspace to another member
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!showMemberSelect && (
                                <div className="flex justify-end">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline" className="bg-slate-700 text-white border-slate-700 hover:bg-slate-800 hover:border-slate-800">
                                                Transfer Ownership
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Transfer workspace ownership?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    You will lose owner privileges. This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => setShowMemberSelect(true)}>
                                                    Continue
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            )}

                            {showMemberSelect && (
                                <>
                                    <Select value={newOwnerId} onValueChange={setNewOwnerId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select new owner" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {workspace.members
                                                .filter((m: any) => m.role !== "owner")
                                                .map((m: any) => (
                                                    <SelectItem key={m.user._id} value={m.user._id}>
                                                        {m.user.name} ({m.user.email})
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>

                                    <div className="flex justify-end gap-2 mt-4">
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

                {/* 4. DANGER ZONE CARD */}
                {isOwner && (
                    <Card className="border border-red-500 mb-5">
                        <CardHeader>
                            <CardTitle className="text-red-600">Danger Zone</CardTitle>
                            <CardDescription>
                                Irreversible actions for workspace
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-end">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">Delete Workspace</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete this workspace?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. All projects, tasks, and members will be permanently removed.
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