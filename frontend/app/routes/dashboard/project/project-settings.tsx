import { BackButton } from "@/components/back-button";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UseProjectQuery } from "@/hooks/use-project";
import { useState } from "react";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { UseDeleteProject, UseUpdateProject } from "@/hooks/use-project";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router";

const ProjectSettings = () => {
    const navigate = useNavigate();
    const { projectId, workspaceId } = useParams<{
        projectId: string;
        workspaceId: string;
    }>();
    if (!projectId) {
        navigate(`/workspaces/${workspaceId}`, { replace: true });
        return null;
    }
    const { data, isLoading } = UseProjectQuery(projectId!) as any;

    if (isLoading) return <Loader />;

    const project = data.project;

    const [title, setTitle] = useState(project.title);
    const [description, setDescription] = useState(project.description ?? "");
    const [status, setStatus] = useState(project.status ?? "Planning");
    const [tags, setTags] = useState(project.tags?.join(", ") ?? "");
    const { mutate: deleteProject, isPending } = UseDeleteProject();
    const { mutate: updateProject, isPending: isUpdating } = UseUpdateProject();
    const isDirty =
        title !== project.title ||
        description !== project.description ||
        status !== project.status ||
        tags !== project.tags?.join(", ");

    return (
        <div className="relative min-h-screen">
            {/* ⬅️ BACK BUTTON — TOP LEFT */}
            <div className="absolute top-4 left-4 z-10">
                <BackButton />
            </div>
            <div className="flex justify-center pt-16">
                <div className="w-full max-w-3xl space-y-8 px-4">
                    {/* Project Settings */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-xl font-semibold">Project Settings</h2>
                            <p className="text-sm text-muted-foreground">
                                Update your project details or delete the project.
                            </p>
                        </CardHeader>

                        <CardContent className="space-y-5">
                            <div>
                                <label className="text-sm font-medium">Project Title</label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                    rows={4}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Status</label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Planning">Planning</SelectItem>
                                        <SelectItem value="In Progress">In Progress</SelectItem>
                                        <SelectItem value="On Hold">On Hold</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Tags</label>
                                <Input
                                    placeholder="coding, backend, web"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                />
                                <div className="flex gap-2 mt-2 flex-wrap">
                                    {tags
                                        .split(",")
                                        .map((tag: string) => tag.trim())
                                        .filter(Boolean)
                                        .map((tag: string) => (
                                            <Badge key={tag} variant="secondary">
                                                {tag}
                                            </Badge>
                                        ))}
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    disabled={!isDirty || isUpdating}
                                    onClick={() =>
                                        updateProject(
                                            {
                                                projectId: projectId!,
                                                payload: {
                                                    title,
                                                    description,
                                                    status,
                                                    tags: tags
                                                        .split(",")
                                                        .map((tag: string) => tag.trim())
                                                        .filter(Boolean),
                                                },
                                            },
                                            {
                                                onSuccess: () => {
                                                    toast.success("Project updated successfully");
                                                },
                                                onError: () => {
                                                    toast.error("Failed to update project");
                                                },
                                            }
                                        )
                                    }
                                >
                                    {isUpdating ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-red-200">
                        <CardHeader>
                            <h3 className="text-red-600 font-semibold">Danger Zone</h3>
                            <p className="text-sm text-muted-foreground">
                                Irreversible action
                            </p>
                        </CardHeader>

                        <CardContent>
                            <div className="flex items-center justify-between w-full">
                                {/* Left side text (or empty spacer) */}
                                <p className="text-sm text-muted-foreground">
                                </p>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive">
                                            Delete Project
                                        </Button>
                                    </AlertDialogTrigger>

                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Project</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently
                                                delete your project and all its data.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>

                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                disabled={isPending}
                                                onClick={() =>
                                                    deleteProject(
                                                        { projectId: projectId! },
                                                        {
                                                            onSuccess: () => {
                                                                toast.success("Project deleted successfully");
                                                                navigate(
                                                                    `/workspaces/${workspaceId}`,
                                                                    { replace: true }
                                                                );
                                                            },
                                                            onError: () => {
                                                                toast.error("Failed to delete project");
                                                            },
                                                        }
                                                    )
                                                }
                                            >
                                                {isPending ? "Deleting..." : "Confirm"}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ProjectSettings;
