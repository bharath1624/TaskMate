import type { User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Users } from "lucide-react";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const Watchers = ({ watchers }: { watchers: User[] }) => {
    return (
        /* ✅ Removed the outer bg-card, border, and the <h3> Watchers title */
        <div className="space-y-3 mt-2">
            {watchers && watchers.length > 0 ? (
                watchers.map((watcher) => (
                    <div key={watcher._id} className="flex items-center gap-3">
                        <Avatar className="size-8 border shadow-sm">
                            <AvatarImage
                                src={
                                    watcher.profilePicture
                                        ? (watcher.profilePicture.startsWith("http")
                                            ? watcher.profilePicture
                                            : `${BACKEND_URL}${watcher.profilePicture}`)
                                        : undefined
                                }
                            />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{watcher.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-medium text-foreground">{watcher.name}</p>
                    </div>
                ))
            ) : (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground text-sm">
                    <Users className="w-6 h-6 mb-2 opacity-60" />
                    No active watchers
                </div>
            )}
        </div>
    );
};