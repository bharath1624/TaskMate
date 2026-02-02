import type { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { inviteMemberSchema } from "@/lib/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Mail } from "lucide-react";
import { useInviteMemberMutation } from "@/hooks/use-workspace";
import { toast } from "sonner";

interface InviteMemberDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    workspaceId: string;
}

export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;

const ROLES = ["admin", "member"] as const;

export const InviteMemberDialog = ({
    isOpen,
    onOpenChange,
    workspaceId,
}: InviteMemberDialogProps) => {
    const form = useForm<InviteMemberFormData>({
        resolver: zodResolver(inviteMemberSchema),
        defaultValues: {
            email: "",
            role: "admin",
        },
    });

    const { mutate, isPending } = useInviteMemberMutation();

    const onSubmit = (data: InviteMemberFormData) => {
        if (!workspaceId) return;

        mutate(
            {
                workspaceId,
                ...data,
            },
            {
                onSuccess: () => {
                    toast.success("Invite sent successfully");
                    form.reset();
                    onOpenChange(false);
                },
                onError: (error: any) => {
                    toast.error(error.response?.data?.message || "Failed to send invite");
                    console.error(error);
                },
            }
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invite to Workspace</DialogTitle>
                </DialogHeader>

                {/* EMAIL INVITE ONLY */}
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex flex-col space-y-6 w-full"
                    >
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Enter email" />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Select Role</FormLabel>
                                    <FormControl>
                                        <div className="flex gap-3 flex-wrap">
                                            {ROLES.map((role) => (
                                                <label
                                                    key={role}
                                                    className="flex items-center cursor-pointer gap-2"
                                                >
                                                    <input
                                                        type="radio"
                                                        value={role}
                                                        className="peer hidden"
                                                        checked={field.value === role}
                                                        onChange={() => field.onChange(role)}
                                                    />
                                                    <span
                                                        className={cn(
                                                            "w-7 h-7 rounded-full border-2 border-blue-300 flex items-center justify-center transition-all duration-300 hover:shadow-lg bg-blue-900 text-white",
                                                            field.value === role &&
                                                            "ring-2 ring-blue-500 ring-offset-2"
                                                        )}
                                                    >
                                                        {field.value === role && (
                                                            <span className="w-3 h-3 rounded-full bg-white" />
                                                        )}
                                                    </span>
                                                    <span className="capitalize">{role}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <Button
                            className="w-full"
                            size="lg"
                            disabled={isPending}
                        >
                            <Mail className="w-4 h-4 mr-2" />
                            {isPending ? "Sending..." : "Send Invite"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
