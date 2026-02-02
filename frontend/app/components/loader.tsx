import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Loader = ({ className }: { className?: string }) => {
    // If a className is passed (e.g., inside a button), render just the icon
    if (className) {
        return <Loader2 className={cn("animate-spin", className)} />;
    }

    // Otherwise, render the full-height centered container
    return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="w-10 h-10 animate-spin" />
        </div>
    );
};