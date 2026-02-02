import { fetchData } from "@/lib/fetch-util";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "../loader";
import type { ActivityLog } from "@/types";
import { getActivityIcon } from "./task-icon";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

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
        <div className="bg-card rounded-lg border shadow-sm h-full flex flex-col w-full min-h-0 overflow-hidden">

            {/* Header */}
            <div className="p-4 border-b shrink-0 bg-card z-10">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold">Activity</h3>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                        {filteredData.length}
                    </span>
                </div>
            </div>

            {/* Content Area */}
            {/* ScrollArea takes all remaining height */}
            <ScrollArea className="flex-1 w-full h-full">
                <div className="p-4 space-y-6 ml-2 pr-3">
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
                        <div className="text-center text-muted-foreground text-sm py-8">
                            No activity recorded yet.
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};