import type { Project } from "@/types";
import { NoDataFound } from "../no-data-found";
import { ProjectCard } from "../project/project-card";

interface ProjectListProps {
    workspaceId: string;
    projects: Project[];

    onCreateProject: () => void;
}

export const ProjectList = ({
    workspaceId,
    projects,
    onCreateProject,
}: ProjectListProps) => {
    return (
        <div>
            <h3 className="text-xl font-medium mb-4">Projects</h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {projects.length === 0 ? (
                    <NoDataFound
                        title="No projects found"
                        description="Create a project to get started"
                        buttonText="Create Project"
                        buttonAction={onCreateProject}
                    />
                ) : (
                    projects.map((project) => {
                        const totalTasks = project.tasks.length;

                        const completedTasks = project.tasks.filter(
                            (task) => task.status === "Done"
                        ).length;

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