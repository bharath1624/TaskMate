import type { Comment, User } from "@/types";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import {
    useAddCommentMutation,
    useGetCommentsByTaskIdQuery,
    useMarkCommentsReadMutation,
} from "@/hooks/use-task";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { format } from "date-fns";
import { Loader } from "../loader";
import { useAuth } from "@/provider/auth-context";
import { cn } from "@/lib/utils";
import { CheckCheck, MessageSquareText } from "lucide-react";
import { socket } from "@/lib/socket";
import { useQueryClient } from "@tanstack/react-query";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const CommentSection = ({
    taskId,
    members,
    assignees = [], // ✅ NEW PROP: Receive Assignees
}: {
    taskId: string;
    members: any[];
    assignees?: User[];
}) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [newComment, setNewComment] = useState("");

    const [showMentions, setShowMentions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState("");

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const { mutate: addComment, isPending } = useAddCommentMutation();
    const { mutate: markRead } = useMarkCommentsReadMutation();

    const { data: comments, isLoading } = useGetCommentsByTaskIdQuery(taskId) as {
        data: Comment[];
        isLoading: boolean;
    };

    const sortedComments = comments ? [...comments].reverse() : [];

    const getMemberData = (member: any) => {
        const userData = member.user || member;
        return {
            _id: userData._id,
            name: userData.name || "Unknown",
            profilePicture: userData.profilePicture,
            role: member.role || "member"
        };
    };

    // ... (UseEffects for Scroll/Socket remain the same) ...
    useEffect(() => { if (comments?.length) markRead(taskId); }, [comments?.length, taskId, markRead]);
    useEffect(() => {
        if (!socket.connected) socket.connect();
        const handleCommentsUpdate = (data: any) => {
            if (data.taskId === taskId) queryClient.invalidateQueries({ queryKey: ["comments", taskId] });
        };
        socket.on("comments_updated", handleCommentsUpdate);
        return () => { socket.off("comments_updated", handleCommentsUpdate); };
    }, [taskId, queryClient]);
    useLayoutEffect(() => {
        if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }, [sortedComments.length]);


    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setNewComment(value);
        const match = value.match(/@(\w*)$/);
        if (match) {
            setShowMentions(true);
            setMentionQuery(match[1].toLowerCase());
        } else {
            setShowMentions(false);
        }
    };

    const insertMention = (memberName: string) => {
        setNewComment(newComment.replace(/@(\w*)$/, `@${memberName} `));
        setShowMentions(false);
    };

    const renderWithMentions = (text: string) => {
        const parts = text.split(/(\s+)/);
        return parts.map((part, i) => {
            if (part.startsWith("@")) {
                const name = part.slice(1);
                const exists = members.some((m) => {
                    const u = getMemberData(m);
                    return u.name.replace(/\s/g, "") === name || u.name === name;
                });
                if (exists) return <span key={i} className="text-blue-500 font-semibold">{part}</span>;
            }
            return part;
        });
    };

    const handleAddComment = () => {
        if (!newComment.trim()) return;
        addComment({ taskId, text: newComment }, {
            onSuccess: () => { setNewComment(""); setShowMentions(false); },
            onError: (err: any) => toast.error(err.response?.data?.message),
        });
    };

    // ✅ STRICT CONTEXT FILTER
    const filteredMembers = members.filter(m => {
        const target = getMemberData(m);

        // 1. Basic Search & Self Filter
        if (!target.name.toLowerCase().includes(mentionQuery)) return false;
        if (target._id === user?._id) return false;

        // 2. Identify MY Role
        const myEntry = members.find(mem => {
            const u = mem.user || mem;
            return u._id === user?._id;
        });
        const myRole = myEntry?.role || "member";

        // 3. Strict Context Check (The "Who is in the task" rule)
        // Check if target is Owner, Admin, or Assigned to this task
        const isOwner = target.role === "owner";
        const isAdmin = target.role === "admin";
        const isAssigned = assignees.some(a => a._id === target._id);

        // If they are just a member AND NOT assigned, hide them.
        if (!isOwner && !isAdmin && !isAssigned) return false;

        // 4. Visibility Rules (Member cannot see Owner)
        if (myRole === "member" && isOwner) return false;

        return true;
    });

    if (isLoading) return <div><Loader /></div>;

    return (
        <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold">Discussion</h3>
            <div className="bg-card rounded-lg p-6 shadow-sm flex flex-col h-[500px] relative">
                {/* ... (Scroll Area code remains same) ... */}
                <div
                    ref={scrollContainerRef}
                    className={cn("flex-1 pr-3 mb-4 overflow-y-auto scrollbar-hide")}
                >
                    <div className="flex flex-col gap-2">
                        {sortedComments.length > 0 ? (
                            sortedComments.map((comment) => {
                                const isMe = comment.author._id === user?._id;
                                const readCount = comment.readBy?.length || 0;
                                const isSeen = readCount >= (members.length - 1);
                                const authorName = comment.author.name || "Unknown";

                                return (
                                    <div key={comment._id} className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
                                        <div className={cn("flex max-w-[85%] md:max-w-[75%]", isMe ? "flex-row-reverse" : "flex-row")}>
                                            {!isMe && (
                                                <Avatar className="size-6 shrink-0 mr-2 mt-1">
                                                    <AvatarImage src={comment.author.profilePicture ? `${BACKEND_URL}${comment.author.profilePicture}` : undefined} />
                                                    <AvatarFallback className="text-[10px]">{authorName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div className="flex flex-col">
                                                {!isMe && <span className="text-[10px] text-muted-foreground font-medium ml-1 mb-0.5">{authorName}</span>}
                                                <div className={cn("relative px-3 py-1.5 shadow-sm text-sm", isMe ? "bg-primary text-primary-foreground rounded-l-lg rounded-tr-none rounded-br-lg" : "bg-muted text-foreground rounded-r-lg rounded-tl-none rounded-bl-lg")}>
                                                    <div className="flex flex-wrap items-end gap-x-2">
                                                        <span className="leading-relaxed wrap-break-word pb-0.5">{renderWithMentions(comment.text)}</span>
                                                        <div className={cn("text-[9px] flex items-center gap-1 ml-auto shrink-0 select-none pb-0.5 h-4", isMe ? "text-primary-foreground/70" : "text-muted-foreground")}>
                                                            {format(new Date(comment.createdAt), "h:mm a").toLowerCase()}
                                                            {isMe && <CheckCheck className={cn("size-3.5", isSeen ? "text-blue-300 dark:text-blue-400" : "text-current opacity-70")} />}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground text-sm">
                                <MessageSquareText className="size-7 mb-2 opacity-60 justify-center" />
                                <p>Start discussion to move work forward</p>
                            </div>

                        )}
                    </div>
                </div>

                <Separator className="my-2" />
                <div className="mt-2 relative">
                    {/* Mention Dropdown */}
                    {showMentions && filteredMembers.length > 0 && (
                        <div className="absolute bottom-full left-0 mb-2 w-48 bg-popover border rounded-md shadow-md z-50 max-h-40 overflow-y-auto">
                            {filteredMembers.map(member => {
                                const u = getMemberData(member);
                                return (
                                    <button key={u._id} className="flex items-center w-full px-3 py-2 text-sm hover:bg-muted text-left" onClick={() => insertMention(u.name.replace(/\s/g, ""))}>
                                        <Avatar className="size-5 mr-2">
                                            <AvatarImage src={u.profilePicture ? `${BACKEND_URL}${u.profilePicture}` : undefined} />
                                            <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        {u.name}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    <Textarea value={newComment} onChange={handleInputChange} className="min-h-[50px] resize-none rounded-2xl px-4 py-3" onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { if (showMentions) setShowMentions(false); else { e.preventDefault(); handleAddComment(); } } }} />
                    <div className="flex justify-end mt-2">
                        <Button size="sm" disabled={!newComment.trim() || isPending} onClick={handleAddComment} className="rounded-full px-6 h-9">{isPending ? "..." : "Send"}</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};