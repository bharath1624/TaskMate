import { Paperclip, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
    useAddTaskAttachmentMutation,
    useDeleteTaskAttachmentMutation,
} from "@/hooks/use-task";
import { cn } from "@/lib/utils";

export const TaskAttachments = ({ task }: { task: any }) => {
    const [mode, setMode] = useState<"file" | "url">("file");
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState("");
    const [fileUrl, setFileUrl] = useState("");
    const [showAddPanel, setShowAddPanel] = useState(false);

    const { mutate: addAttachment, isPending } =
        useAddTaskAttachmentMutation();

    const { mutate: deleteAttachment } =
        useDeleteTaskAttachmentMutation();

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

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Paperclip className="size-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Attachments</h3>
                    <span className="text-xs text-muted-foreground">
                        ({task.attachments?.length || 0})
                    </span>
                </div>

                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAddPanel((v) => !v)}
                >
                    + Add
                </Button>
            </div>

            {/* Add Attachment Panel */}
            {showAddPanel && (
                <div className="rounded-lg border bg-card p-4 space-y-4">
                    {/* Segmented Tabs */}
                    <div className="grid grid-cols-2 rounded-md border overflow-hidden">
                        <button
                            className={cn(
                                "flex items-center justify-center gap-2 py-3 text-sm transition",
                                mode === "file"
                                    ? "bg-muted font-medium"
                                    : "text-muted-foreground hover:bg-muted/50"
                            )}
                            onClick={() => setMode("file")}
                        >
                            📤 Upload
                        </button>

                        <button
                            className={cn(
                                "flex items-center justify-center gap-2 py-3 text-sm transition border-l",
                                mode === "url"
                                    ? "bg-muted font-medium"
                                    : "text-muted-foreground hover:bg-muted/50"
                            )}
                            onClick={() => setMode("url")}
                        >
                            🔗 URL
                        </button>
                    </div>

                    {/* Content */}
                    {mode === "file" ? (
                        <Input
                            type="file"
                            className="w-full"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                    ) : (
                        <div className="space-y-2">
                            <Input
                                placeholder="File Name "
                                value={fileName}
                                onChange={(e) => setFileName(e.target.value)}
                            />
                            <Input
                                placeholder="File URL"
                                value={fileUrl}
                                onChange={(e) => setFileUrl(e.target.value)}
                            />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                                setShowAddPanel(false);
                                setMode("file");
                                setFile(null);
                                setFileName("");
                                setFileUrl("");
                            }}
                        >
                            Cancel
                        </Button>

                        <Button size="sm" disabled={isPending} onClick={handleAdd}>
                            Add Attachment
                        </Button>
                    </div>
                </div>
            )}

            {/* Attachments List (ALWAYS VISIBLE IF EXISTS) */}
            {task.attachments?.length > 0 && (
                <ul className="space-y-2">
                    {task.attachments
                        ?.filter((att: any) => att && att.fileUrl)
                        .map((att: any) => (
                            <li
                                key={att._id}
                                className="group flex items-center justify-between rounded-md border px-3 py-2 hover:bg-muted transition"
                            >
                                <a
                                    href={att.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm truncate"
                                >
                                    <Paperclip className="size-4 text-muted-foreground" />
                                    <span className="truncate">{att.fileName}</span>
                                </a>

                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="opacity-0 group-hover:opacity-100 transition"
                                    onClick={() =>
                                        deleteAttachment({
                                            taskId: task._id,
                                            attachmentId: att._id,
                                        })
                                    }
                                >
                                    <Trash className="size-4 text-destructive" />
                                </Button>
                            </li>
                        ))}

                </ul>
            )}
        </div>
    );
};
