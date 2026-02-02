import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/loader";
import { useSearchParams } from "react-router";
import { format } from "date-fns";
import type { Project, Task } from "@/types";
import { useGetArchivedDataQuery } from "@/hooks/use-workspace";
import { Link } from "react-router";
import { Archive, ArchiveX, FolderArchive } from "lucide-react";


const Achieved = () => {
    const [searchParams] = useSearchParams();
    const workspaceId = searchParams.get("workspaceId");

    const { data, isLoading } = useGetArchivedDataQuery(workspaceId!) as {
        data: {
            archivedProjects: Project[];
            archivedTasks: Task[];
        };
        isLoading: boolean;
    };

    if (!workspaceId) {
        return (
            <div className="text-muted-foreground text-center py-10">
                Select a workspace to view archived items
            </div>
        );
    }

    if (isLoading || !data) {
        return <Loader />;
    }


    return (
        <div className="space-y-8 pt-5">
            {/* ================= ARCHIVED PROJECTS  ================= */}
            <Card>
                <CardHeader>
                    <CardTitle>Archived Projects</CardTitle>
                </CardHeader>
                <CardContent>
                    <table className="w-full text-sm">
                        <thead className="border-b">
                            <tr className="text-left text-muted-foreground">
                                <th className="py-2">Project Name</th>
                                <th>Status</th>
                                <th>Timeline</th>
                                <th>Last Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.archivedProjects.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-10">
                                        <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                                            <FolderArchive className="h-8 w-8 opacity-70" />
                                            <p className="text-sm font-medium">No archived projects</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                data.archivedProjects.map((project) => (
                                    <tr
                                        key={project._id}
                                        className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                                    >
                                        <td className="py-4">
                                            <Link
                                                // Link to settings so user can restore it
                                                to={`/workspaces/${workspaceId}/projects/${project._id}/settings`}
                                                className="font-medium text-primary hover:underline"
                                            >
                                                {project.title}
                                            </Link>
                                        </td>

                                        <td>
                                            <Badge variant="outline">{project.status}</Badge>
                                        </td>

                                        <td>
                                            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                                                {project.startDate && (
                                                    <span>Start: {format(new Date(project.startDate), "MMM d, yyyy")}</span>
                                                )}
                                                {project.dueDate && (
                                                    <span>Due: {format(new Date(project.dueDate), "MMM d, yyyy")}</span>
                                                )}
                                                {!project.startDate && !project.dueDate && <span>No dates set</span>}
                                            </div>
                                        </td>

                                        <td className="text-muted-foreground">
                                            {format(new Date(project.updatedAt), "MMM d, yyyy")}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
            {/* ================= ARCHIVED TASKS ================= */}
            <Card>
                <CardHeader>
                    <CardTitle>Archived Tasks</CardTitle>
                </CardHeader>

                <CardContent>
                    <table className="w-full text-sm">
                        <thead className="border-b">
                            <tr className="text-left text-muted-foreground">
                                <th className="py-2">Title</th>
                                <th>Status</th>
                                <th>Priority</th>
                                <th>Project</th>
                                <th>Last Updated</th>
                            </tr>
                        </thead>

                        <tbody>
                            {data.archivedTasks.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-10">
                                        <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                                            <Archive className="h-8 w-8 opacity-70" />
                                            <p className="text-sm font-medium">No archived tasks</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                data.archivedTasks.map((task) => (
                                    <tr
                                        key={task._id}
                                        className="border-b last:border-0 hover:bg-muted cursor-pointer"
                                    >
                                        <td className="py-3">
                                            <Link
                                                to={`/workspaces/${workspaceId}/projects/${task.project._id}/tasks/${task._id}`}
                                                className="block"
                                            >
                                                <p className="font-medium text-primary hover:underline">
                                                    {task.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground">Task</p>
                                            </Link>
                                        </td>

                                        <td>
                                            <Badge>{task.status}</Badge>
                                        </td>

                                        <td>
                                            <Badge
                                                variant={
                                                    task.priority === "High"
                                                        ? "destructive"
                                                        : task.priority === "Medium"
                                                            ? "default"
                                                            : "outline"
                                                }
                                            >
                                                {task.priority}
                                            </Badge>
                                        </td>

                                        <td>{task.project?.title}</td>

                                        <td>
                                            {format(new Date(task.updatedAt), "MMM d, yyyy")}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>


                    </table>
                </CardContent>
            </Card>
        </div>
    );
};

export default Achieved;
