import { format, isToday, isPast } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarClock, AlertCircle, AlertTriangle } from "lucide-react";

interface TaskDateProps {
    date: string | Date;
    status: string;
    className?: string;
}

export const TaskDate = ({ date, status, className }: TaskDateProps) => {
    const dueDate = new Date(date);
    const isCompleted = ["done", "completed"].includes(status.toLowerCase());

    // Default Style (Future Date)
    let colorClass = "text-muted-foreground";
    let icon = <CalendarClock className="size-3.5 mr-1.5" />;
    let text = format(dueDate, "MMM dd");

    if (!isCompleted) {
        if (isPast(dueDate) && !isToday(dueDate)) {
            // 🚨 OVERDUE (Red)
            colorClass = "text-red-600 font-bold bg-red-100/50 px-2 py-0.5 rounded-full border border-red-200 dark:bg-red-900/20 dark:border-red-900";
            icon = <AlertCircle className="size-3.5 mr-1.5" />;
        } else if (isToday(dueDate)) {
            // ⚠️ DUE TODAY (Orange)
            colorClass = "text-amber-600 font-bold bg-amber-100/50 px-2 py-0.5 rounded-full border border-amber-200 dark:bg-amber-900/20 dark:border-amber-900";
            icon = <AlertTriangle className="size-3.5 mr-1.5" />;
            text = "Today";
        }
    } else {
        // ✅ COMPLETED (Green/Crossed out)
        colorClass = "text-green-600 line-through opacity-70";
    }

    return (
        <div className={cn("flex items-center text-xs w-fit transition-colors", colorClass, className)}>
            {icon}
            <span>{text}</span>
        </div>
    );
};