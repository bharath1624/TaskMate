import { fetchData } from "@/lib/fetch-util";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "../loader";
import type { ActivityLog } from "@/types";
import { getActivityIcon } from "./task-icon";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { History } from "lucide-react";

export const TaskActivity = ({ resourceId }: { resourceId: string }) => {
    const { data, isPending } = useQuery({
        queryKey: ["task-activity", resourceId],
        queryFn: () => fetchData(`/tasks/${resourceId}/activity`),
    }) as {
        data: ActivityLog[];
        isPending: boolean;
    };

    const filteredData = data?.filter((activity) => activity.action !== "added_comment") || [];

    if (isPending) return <Loader />;

    return (
        <div
            className={cn(
                "w-full flex-1 overflow-y-auto",
                // ✅ Theme-aware scrollbar classes
                "[&::-webkit-scrollbar]:w-1.5",
                "[&::-webkit-scrollbar-track]:bg-transparent",
                "[&::-webkit-scrollbar-thumb]:bg-black/10 dark:[&::-webkit-scrollbar-thumb]:bg-white/10",
                "[&::-webkit-scrollbar-thumb]:rounded-full",
                "hover:[&::-webkit-scrollbar-thumb]:bg-black/20 dark:hover:[&::-webkit-scrollbar-thumb]:bg-white/20"
            )}
        >
            <div className="space-y-6 pt-2 pb-4">
                {filteredData.map((activity, index) => (
                    <div key={activity._id} className="relative flex gap-4 group">
                        {/* Timeline Line */}
                        {index !== filteredData.length - 1 && (
                            <div
                                className="absolute left-[15px] top-8 -bottom-6 w-0.5 bg-muted group-last:hidden"
                                aria-hidden="true"
                            />
                        )}

                        {/* Icon */}
                        <div className="relative z-10">
                            <div className={cn(
                                "size-8 rounded-full border flex items-center justify-center bg-background",
                                "text-muted-foreground shadow-sm group-hover:border-primary/50 group-hover:text-primary transition-colors"
                            )}>
                                {getActivityIcon(activity.action)}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 pt-1">
                            <p className="text-sm leading-none text-foreground">
                                <span className="font-semibold text-primary/90 mr-1">
                                    {activity.user.name}
                                </span>
                                <span className="text-muted-foreground font-normal">
                                    {activity.details?.description}
                                </span>
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-1.5">
                                {activity.createdAt
                                    ? formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })
                                    : "Just now"
                                }
                            </p>
                        </div>
                    </div>
                ))}

                {filteredData.length === 0 && (
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground text-sm py-12 gap-3">
                        <div className="p-3 rounded-full bg-muted">
                            <History className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <p className="font-medium">No activity entries are available</p>
                    </div>
                )}
            </div>
        </div>
    );
};