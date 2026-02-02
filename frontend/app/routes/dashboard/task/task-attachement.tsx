import { Paperclip, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
    useAddTaskAttachmentMutation,
    useDeleteTaskAttachmentMutation,
} from "@/hooks/use-task";
import { cn } from "@/lib/utils";
import { useAuth } from "@/provider/auth-context";

interface TaskAttachmentsProps {
    task: any;
    workspaceOwnerId?: string;
    currentUserRole?: string;
}

export const TaskAttachments = ({ task, workspaceOwnerId, currentUserRole }: TaskAttachmentsProps) => {
    const { user } = useAuth();
    const currentUserId = user?._id;

    const [mode, setMode] = useState<"file" | "url">("file");
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState("");
    const [fileUrl, setFileUrl] = useState("");
    const [showAddPanel, setShowAddPanel] = useState(false);

    const { mutate: addAttachment, isPending } = useAddTaskAttachmentMutation();
    const { mutate: deleteAttachment } = useDeleteTaskAttachmentMutation();

    const handleAdd = () => {
        const formData = new FormData();
        if (mode === "file") {
            if (!file) return;
            formData.append("type", "file");
            formData.append("file", file);
        } else {
            if (!fileName || !fileUrl) return;
            formData.append("type", "url");
            formData.append("fileName", fileName);
            formData.append("fileUrl", fileUrl);
        }

        addAttachment(
            { taskId: task._id, formData },
            {
                onSuccess: () => {
                    setShowAddPanel(false);
                    setMode("file");
                    setFile(null);
                    setFileName("");
                    setFileUrl("");
                },
            }
        );
    };

    // 🔒 PERMISSION CHECKER FUNCTION
    const canDelete = (attachment: any) => {
        const uploaderId = attachment.uploadedBy;

        // 1. Owner can delete everything
        if (currentUserRole === "owner") return true;

        // 2. Admin Logic
        if (currentUserRole === "admin") {
            // Can delete if uploader is NOT the owner
            return uploaderId !== workspaceOwnerId;
        }

        // 3. Member Logic (Delete only own)
        return uploaderId === currentUserId;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Paperclip className="size-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Attachments</h3>
                    <span className="text-xs text-muted-foreground">({task.attachments?.length || 0})</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => setShowAddPanel((v) => !v)}>
                    + Add
                </Button>
            </div>

            {showAddPanel && (
                <div className="rounded-lg border bg-card p-4 space-y-4">
                    <div className="grid grid-cols-2 rounded-md border overflow-hidden">
                        <button
                            className={cn("flex items-center justify-center gap-2 py-3 text-sm transition", mode === "file" ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/50")}
                            onClick={() => setMode("file")}
                        >
                            📤 Upload
                        </button>
                        <button
                            className={cn("flex items-center justify-center gap-2 py-3 text-sm transition border-l", mode === "url" ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/50")}
                            onClick={() => setMode("url")}
                        >
                            🔗 URL
                        </button>
                    </div>

                    {mode === "file" ? (
                        <Input type="file" className="w-full" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    ) : (
                        <div className="space-y-2">
                            <Input placeholder="File Name" value={fileName} onChange={(e) => setFileName(e.target.value)} />
                            <Input placeholder="File URL" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} />
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setShowAddPanel(false)}>Cancel</Button>
                        <Button size="sm" disabled={isPending} onClick={handleAdd}>Add Attachment</Button>
                    </div>
                </div>
            )}

            {task.attachments?.length > 0 && (
                <ul className="space-y-2">
                    {task.attachments?.map((att: any) => (
                        <li
                            key={att._id}
                            // ✅ Change py-2 to a fixed height like h-11 or h-12
                            className="group flex items-center justify-between rounded-md border px-3 h-12 hover:bg-muted transition">
                            <a
                                href={att.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm truncate py-1" // Added small padding to anchor for better click area
                            >
                                <Paperclip className="size-4 text-muted-foreground" />
                                <span className="truncate">{att.fileName}</span>
                            </a>
                            {/* The button remains the same, but now it won't stretch the container */}
                            {canDelete(att) && (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="opacity-0 group-hover:opacity-100 transition size-8" // size-8 makes the button slightly more compact
                                    onClick={() => deleteAttachment({ taskId: task._id, attachmentId: att._id })}
                                >
                                    <Trash className="size-4 text-destructive" />
                                </Button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};