import { FileText, Image, File, Sheet, Presentation, Trash, Paperclip, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import {
    useAddTaskAttachmentMutation,
    useDeleteTaskAttachmentMutation,
} from "@/hooks/use-task";
import { cn } from "@/lib/utils";
import { useAuth } from "@/provider/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface TaskAttachmentsProps {
    task: any;
    workspaceOwnerId?: string;
    currentUserRole?: string;
    members?: any[]; // ✅ Added members array
}

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const ACCEPTED_EXTENSIONS = [
    ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg",
    ".pdf",
    ".doc", ".docx",
    ".xls", ".xlsx",
    ".ppt", ".pptx",
    ".txt", ".csv",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getCategory = (fileType = "", fileName = "") => {
    if (fileType.startsWith("image/")) return "image";
    if (fileType === "application/pdf") return "pdf";
    if (fileType.includes("word") || fileType.includes("document")) return "doc";
    if (fileType.includes("excel") || fileType.includes("spreadsheet") || fileType === "text/csv" || fileType === "application/csv") return "sheet";
    if (fileType.includes("powerpoint") || fileType.includes("presentation")) return "slides";
    if (fileType === "text/plain") return "text";
    const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "image";
    if (ext === "pdf") return "pdf";
    if (["doc", "docx"].includes(ext)) return "doc";
    if (["xls", "xlsx", "csv"].includes(ext)) return "sheet";
    if (["ppt", "pptx"].includes(ext)) return "slides";
    if (ext === "txt") return "text";
    return "other";
};

const getCategoryIcon = (category: string) => {
    const cls = "size-4 shrink-0";
    switch (category) {
        case "image": return <Image className={`${cls} text-blue-500`} />;
        case "pdf": return <FileText className={`${cls} text-red-500`} />;
        case "doc": return <FileText className={`${cls} text-blue-600`} />;
        case "sheet": return <Sheet className={`${cls} text-green-600`} />;
        case "slides": return <Presentation className={`${cls} text-orange-500`} />;
        case "text": return <FileText className={`${cls} text-gray-500`} />;
        default: return <File className={`${cls} text-muted-foreground`} />;
    }
};

const formatSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const openFile = (att: any) => {
    const category = getCategory(att.fileType, att.fileName);
    const ext = att.fileName.split(".").pop()?.toLowerCase() ?? "";

    // ✅ FIX: Clean the URL coming from the database!
    // If the DB accidentally saved 'fl_inline', this strips it out safely so Cloudinary accepts it.
    let safeUrl = att.fileUrl;
    if (safeUrl.includes("/upload/fl_inline/")) {
        safeUrl = safeUrl.replace("/upload/fl_inline/", "/upload/");
    }

    if (att.type === "url") {
        window.open(safeUrl, "_blank", "noopener,noreferrer");
        return;
    }

    if (category === "image" || category === "pdf" || ext === "csv" || category === "text") {
        window.open(safeUrl, "_blank", "noopener,noreferrer");
    } else {
        const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(safeUrl)}&embedded=false`;
        window.open(viewerUrl, "_blank", "noopener,noreferrer");
    }
};
// ─── Component ────────────────────────────────────────────────────────────────

export const TaskAttachments = ({
    task,
    workspaceOwnerId,
    currentUserRole,
    members = [], // default to empty array
}: TaskAttachmentsProps) => {
    const { user } = useAuth();
    const currentUserId = user?._id;

    const [mode, setMode] = useState<"file" | "url">("file");
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState("");
    const [fileUrl, setFileUrl] = useState("");
    const [showAddPanel, setShowAddPanel] = useState(false);

    const { mutate: addAttachment, isPending } = useAddTaskAttachmentMutation();
    const { mutate: deleteAttachment } = useDeleteTaskAttachmentMutation();

    const validateFile = (f: File): string | null => {
        if (f.size > MAX_FILE_SIZE_BYTES) {
            return `File too large. Maximum size is ${MAX_FILE_SIZE_MB} MB. Your file is ${formatSize(f.size)}.`;
        }
        const ext = "." + (f.name.split(".").pop()?.toLowerCase() ?? "");
        if (!ACCEPTED_EXTENSIONS.includes(ext)) {
            return `File type "${ext}" is not supported. Allowed: Images, PDF, Word, Excel, PowerPoint, TXT, CSV.`;
        }
        return null;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0] ?? null;
        if (!selected) { setFile(null); return; }

        const error = validateFile(selected);
        if (error) {
            toast.error(error);
            e.target.value = "";
            setFile(null);
            return;
        }
        setFile(selected);
    };

    const handleAdd = () => {
        if (mode === "file") {
            if (!file) {
                toast.error("Please select a file first.");
                return;
            }
            const error = validateFile(file);
            if (error) { toast.error(error); return; }
        } else {
            if (!fileName.trim()) {
                toast.error("Please enter a display name for the link.");
                return;
            }
            if (!fileUrl.trim() || !fileUrl.startsWith("http")) {
                toast.error("Please enter a valid URL starting with http:// or https://");
                return;
            }
        }

        const formData = new FormData();
        if (mode === "file") {
            formData.append("type", "file");
            formData.append("file", file!);
        } else {
            formData.append("type", "url");
            formData.append("fileName", fileName.trim());
            formData.append("fileUrl", fileUrl.trim());
        }

        addAttachment(
            { taskId: task._id, formData },
            {
                onSuccess: () => {
                    toast.success("Attachment added successfully.");
                    setShowAddPanel(false);
                    setMode("file");
                    setFile(null);
                    setFileName("");
                    setFileUrl("");
                },
                onError: (err: any) => {
                    const msg = err?.response?.data?.message ?? "Failed to upload attachment.";
                    if (err?.response?.status === 413) {
                        toast.error(`File too large. Maximum size is ${MAX_FILE_SIZE_MB} MB.`);
                    } else {
                        toast.error(msg);
                    }
                },
            }
        );
    };

    const handleDelete = (att: any) => {
        deleteAttachment(
            { taskId: task._id, attachmentId: att._id },
            {
                onSuccess: () => toast.success("Attachment removed."),
                onError: () => toast.error("Failed to remove attachment."),
            }
        );
    };

    const canDelete = (attachment: any) => {
        if (currentUserRole === "owner") return true;
        if (currentUserRole === "admin") return attachment.uploadedBy !== workspaceOwnerId;
        return attachment.uploadedBy === currentUserId;
    };

    // Helper to find uploader's user object from the members array
    const getUploader = (uploadedById: string) => {
        const member = members.find((m: any) => m.user._id === uploadedById);
        return member?.user;
    };

    return (
        <div className="space-y-4">
            {/* ✅ Header (Title & Button perfectly aligned) */}
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Paperclip className="size-4" /> Attachments
                    <span className="text-xs text-muted-foreground font-medium">
                        ({task.attachments?.length || 0})
                    </span>
                </h3>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAddPanel((v) => !v)}
                    className="h-8 shadow-sm transition-all"
                >
                    {showAddPanel ? "+" : "+ Add"}
                </Button>
            </div>

            {/* Upload panel */}
            {showAddPanel && (
                <div className="rounded-lg border bg-card p-4 space-y-3 shadow-sm mb-4">
                    {/* Tab switcher */}
                    <div className="grid grid-cols-2 rounded-md border overflow-hidden text-sm">
                        <button
                            className={cn(
                                "py-2.5 transition",
                                mode === "file"
                                    ? "bg-muted font-medium"
                                    : "text-muted-foreground hover:bg-muted/50"
                            )}
                            onClick={() => setMode("file")}
                        >
                            Upload File
                        </button>
                        <button
                            className={cn(
                                "py-2.5 border-l transition",
                                mode === "url"
                                    ? "bg-muted font-medium"
                                    : "text-muted-foreground hover:bg-muted/50"
                            )}
                            onClick={() => setMode("url")}
                        >
                            Link URL
                        </button>
                    </div>

                    {mode === "file" ? (
                        <div className="space-y-1.5">
                            <Input
                                type="file"
                                className="w-full cursor-pointer"
                                accept={ACCEPTED_EXTENSIONS.join(",")}
                                onChange={handleFileChange}
                            />
                            <p className="text-xs text-muted-foreground">
                                Max {MAX_FILE_SIZE_MB} MB
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Input
                                placeholder="Display name (e.g. Design brief)"
                                value={fileName}
                                onChange={(e) => setFileName(e.target.value)}
                            />
                            <Input
                                placeholder="https://..."
                                value={fileUrl}
                                onChange={(e) => setFileUrl(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                                setShowAddPanel(false);
                                setFile(null);
                                setFileName("");
                                setFileUrl("");
                            }}
                        >
                            Cancel
                        </Button>
                        <Button size="sm" disabled={isPending} onClick={handleAdd}>
                            {isPending ? "Uploading..." : "Add Attachment"}
                        </Button>
                    </div>
                </div>
            )}

            {/* Attachment list */}
            {task.attachments?.length > 0 && (
                <ul className="space-y-2">
                    {task.attachments.map((att: any) => {
                        const category = getCategory(att.fileType, att.fileName);
                        const uploader = getUploader(att.uploadedBy);

                        return (
                            <li
                                key={att._id}
                                className="group flex items-center rounded-xl border border-border/60 bg-background p-2 hover:bg-muted/30 transition-all shadow-sm gap-3"
                            >
                                {/* ⬅️ LEFT SIDE: Avatar & Name */}
                                <div className="flex items-center gap-2.5 w-[110px] sm:w-[130px] shrink-0 border-r border-border/50 pr-2">
                                    {uploader && (
                                        <>
                                            <Avatar className="size-8 border border-border/50 shadow-sm shrink-0">
                                                <AvatarImage
                                                    src={uploader.profilePicture
                                                        ? (uploader.profilePicture.startsWith("http")
                                                            ? uploader.profilePicture
                                                            : `${BACKEND_URL}${uploader.profilePicture}`)
                                                        : undefined}
                                                />
                                                <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-medium">
                                                    {uploader.name.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span
                                                className="text-xs font-medium text-muted-foreground truncate"
                                                title={uploader.name}
                                            >
                                                {uploader.name.split(" ")[0]}
                                            </span>
                                        </>
                                    )}
                                </div>

                                {/* ➡️ RIGHT SIDE: File Info & Delete Button */}
                                <div className="flex items-center justify-end flex-1 min-w-0 pl-2">

                                    {/* ml-auto pushes this block completely to the right */}
                                    <button
                                        className="flex items-center gap-3 min-w-0 ml-auto text-right hover:opacity-80 transition-opacity"
                                        onClick={() => openFile(att)}
                                        title={`Open ${att.fileName}`}
                                    >
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-medium truncate text-foreground/90 group-hover:text-primary transition-colors w-full">
                                                {att.fileName}
                                            </span>
                                            {att.fileSize > 0 && (
                                                <span className="text-xs text-muted-foreground truncate mt-0.5 w-full">
                                                    {formatSize(att.fileSize)}
                                                </span>
                                            )}
                                        </div>

                                        {/* Icon moved to the right side of the text */}
                                        <div className="p-2 bg-muted/60 rounded-lg shrink-0 group-hover:bg-background transition-colors">
                                            {getCategoryIcon(category)}
                                        </div>
                                    </button>

                                    {/* Delete Button Wrapper */}
                                    <div className="w-8 ml-2 flex justify-end shrink-0">
                                        {canDelete(att) && (
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="opacity-0 group-hover:opacity-100 transition size-8 hover:bg-destructive/10 hover:text-destructive"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(att);
                                                }}
                                            >
                                                <Trash className="size-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};