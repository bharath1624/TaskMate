import type { Project } from "@/types";
import { NoDataFound } from "../no-data-found";
import { ProjectCard } from "../project/project-card";

interface ProjectListProps {
    workspaceId: string;
    projects: Project[];
    onCreateProject: () => void;
    canCreateProject: boolean; // ✅ ADDED THIS PROP
}

export const ProjectList = ({
    workspaceId,
    projects,
    onCreateProject,
    canCreateProject, // ✅ DESTRUCTURED HERE
}: ProjectListProps) => {
    return (
        <div>
            <h3 className="text-xl font-medium mb-4">Projects</h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {projects.length === 0 ? (
                    <NoDataFound
                        title="No projects found"
                        // ✅ Change description based on role
                        description={canCreateProject ? "Create a project to get started" : "No projects have been added to this workspace yet."}

                        // ✅ Only pass button props if they have permission
                        {...(canCreateProject && {
                            buttonText: "Create Project",
                            buttonAction: onCreateProject,
                        })}
                    />
                ) : (
                    projects.map((project) => {
                        // Filter out archived tasks first
                        const activeTasks = project.tasks.filter((task) => !task.isArchived);

                        // 1. Calculate Total (only active tasks)
                        const totalTasks = activeTasks.length;

                        // 2. Calculate Completed (only active tasks that are "Done")
                        const completedTasks = activeTasks.filter(
                            (task) => task.status === "Done"
                        ).length;

                        // 3. Calculate Progress
                        const projectProgress =
                            totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

                        return (
                            <ProjectCard
                                key={project._id}
                                project={project}
                                progress={projectProgress}
                                workspaceId={workspaceId}
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
};