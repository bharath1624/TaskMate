import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/loader";
import { useSearchParams } from "react-router";
import { format } from "date-fns";
import type { Project, Task } from "@/types";
import { useGetArchivedDataQuery } from "@/hooks/use-workspace";
import { Link } from "react-router";


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
                                <th>Updated At</th>
                            </tr>
                        </thead>

                        <tbody>
                            {data.archivedTasks.map((task) => (
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
                            ))}
                        </tbody>

                    </table>
                </CardContent>
            </Card>
        </div>
    );
};

export default Achieved;
