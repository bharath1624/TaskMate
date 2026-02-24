import type { User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Eye, Users } from "lucide-react";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const Watchers = ({ watchers }: { watchers: User[] }) => {
    return (
        <div className="bg-card rounded-lg p-6 shadow-sm mb-6">
            <h3 className="text-lg font-medium mb-4">Watchers</h3>

            <div className="space-y-2">
                {watchers && watchers.length > 0 ? (
                    watchers.map((watcher) => (
                        <div key={watcher._id} className="flex items-center gap-2">
                            <Avatar className="size-6">
                                <AvatarImage
                                    src={
                                        watcher.profilePicture
                                            ? `${BACKEND_URL}${watcher.profilePicture}`
                                            : undefined
                                    }
                                />

                                <AvatarFallback>{watcher.name.charAt(0)}</AvatarFallback>
                            </Avatar>

                            <p className="text-sm text-muted-foreground">{watcher.name}</p>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-muted-foreground text-sm">
                        <Users className="w-6 h-6 mb-2 opacity-60" />
                        No active watchers
                    </div>
                )}
            </div>
        </div>
    );
};