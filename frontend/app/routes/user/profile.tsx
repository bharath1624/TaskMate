import { BackButton } from "@/components/back-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    useChangePassword,
    useUpdateUserProfile,
    useUserProfileQuery,
} from "@/hooks/use-user";
import { useAuth } from "@/provider/auth-context";
import type { User } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Camera, Loader2, ShieldCheck, UserCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

const changePasswordSchema = z
    .object({
        currentPassword: z
            .string()
            .min(1, { message: "Current password is required" }),
        newPassword: z.string().min(8, { message: "New password is required" }),
        confirmPassword: z
            .string()
            .min(8, { message: "Confirm password is required" }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

const profileSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;

const Profile = () => {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [removeAvatarFlag, setRemoveAvatarFlag] = useState(false);

    const { data: user, isPending } = useUserProfileQuery() as {
        data: User;
        isPending: boolean;
    };
    const { logout } = useAuth();
    const navigate = useNavigate();

    const form = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const profileForm = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || "",
        },
    });

    useEffect(() => {
        if (user) {
            profileForm.reset({
                name: user.name,
            });
            setRemoveAvatarFlag(false);
            setAvatarPreview(null);
            setAvatarFile(null);
        }
    }, [user, profileForm]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error("Image must be less than 2MB");
            return;
        }

        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
        setRemoveAvatarFlag(false);
    };

    const handleRemoveAvatar = () => {
        setAvatarFile(null);
        setAvatarPreview(null);
        setRemoveAvatarFlag(true);
    };

    const { mutate: updateUserProfile, isPending: isUpdatingProfile } = useUpdateUserProfile();
    const { mutate: changePassword, isPending: isChangingPassword, error } = useChangePassword();

    const handlePasswordChange = (values: ChangePasswordFormData) => {
        changePassword(values, {
            onSuccess: () => {
                toast.success("Password updated successfully. You will be logged out. Please login again.");
                form.reset();
                setTimeout(() => {
                    logout();
                    navigate("/sign-in");
                }, 3000);
            },
            onError: (error: any) => {
                const errorMessage = error.response?.data?.error || "Failed to update password";
                toast.error(errorMessage);
            },
        });
    };

    const handleProfileFormSubmit = (values: ProfileFormData) => {
        const formData = new FormData();
        formData.append("name", values.name);
        if (avatarFile) formData.append("avatar", avatarFile);
        if (removeAvatarFlag) formData.append("removeAvatar", "true");

        updateUserProfile(formData, {
            onSuccess: () => {
                toast.success("Profile updated successfully");
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.error || "Failed to update profile");
            },
        });
    };

    if (isPending)
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-100px)] w-full">
                <Loader2 className="animate-spin text-blue-600 size-10" />
            </div>
        );

    let displayImage = undefined;
    if (!removeAvatarFlag) {
        if (avatarPreview) {
            displayImage = avatarPreview;
        } else if (user?.profilePicture) {
            displayImage = user.profilePicture.startsWith("http")
                ? user.profilePicture
                : `${BACKEND_URL}${user.profilePicture}`;
        }
    }

    return (
        /* 🔥 FULL WIDTH BREAKOUT WRAPPER 🔥 */
        <div className="relative left-1/2 -translate-x-1/2 w-screen min-h-screen bg-background text-foreground px-4 sm:px-8 lg:px-12 pb-16 -mt-6 sm:-mt-8 pt-2 overflow-hidden">

            {/* ================= THEME-AWARE BACKGROUND EFFECTS ================= */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {/* Soft glowing orbs that adapt to light/dark mode */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 dark:bg-blue-600/20 rounded-full blur-[120px] mix-blend-normal" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 dark:bg-indigo-600/20 rounded-full blur-[120px] mix-blend-normal" />
                {/* Dot matrix pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(0,0,0,0.03)_1.5px,transparent_1.5px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(255,255,255,0.03)_1.5px,transparent_1.5px)] bg-size-[32px_32px] mask-[radial-gradient(ellipse_60%_60%_at_50%_50%,#000_40%,transparent_100%)] opacity-100" />
            </div>

            {/* Inner Content Container */}
            <div className="w-full max-w-[1400px] flex flex-col mx-auto relative z-10 pt-6">

                {/* ================= HEADER ================= */}
                <div className="w-full pb-8 mb-8 border-b border-border/40">
                    <div className="flex items-center gap-3.5 mb-2">
                        <div className="bg-linear-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
                            <UserCircle className="size-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight">Account Settings</h1>
                    </div>
                    <p className="text-muted-foreground ml-[58px] text-sm sm:text-base">
                        Manage your personal profile and secure your account.
                    </p>
                </div>

                {/* ================= GRID LAYOUT ================= */}
                {/* Changed to 1:1 ratio (cols-2) on extra large screens for perfect symmetry */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-stretch w-full">

                    {/* ================= LEFT PANEL: PROFILE ================= */}
                    <div className="bg-card/60 backdrop-blur-2xl border border-border/50 rounded-4xl p-6 sm:p-10 shadow-xl relative overflow-hidden flex flex-col h-full">
                        {/* Top Gradient Line */}
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-blue-500 to-indigo-500 opacity-80" />

                        <div className="mb-8">
                            <h2 className="text-2xl font-bold">Personal Profile</h2>
                            <p className="text-sm text-muted-foreground mt-1.5">How you appear to your team members.</p>
                        </div>

                        <Form {...profileForm}>
                            <form onSubmit={profileForm.handleSubmit(handleProfileFormSubmit)} className="flex flex-col flex-1 gap-6">

                                {/* Island 1: Avatar */}
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 rounded-2xl bg-muted/40 border border-border/50 shadow-sm">
                                    <div className="relative group shrink-0">
                                        <Avatar className="h-28 w-28 border-4 border-background shadow-md bg-muted">
                                            <AvatarImage src={displayImage} className="object-cover" />
                                            <AvatarFallback className="bg-linear-to-br from-blue-500 to-indigo-600 text-white text-4xl font-bold">
                                                {user?.name?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>

                                        <button
                                            type="button"
                                            onClick={() => document.getElementById("avatar-upload")?.click()}
                                            className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-[2px]"
                                        >
                                            <Camera className="size-8" />
                                        </button>
                                    </div>

                                    <div className="space-y-3 text-center sm:text-left w-full">
                                        <div>
                                            <h3 className="font-semibold">Profile Photo</h3>
                                            <p className="text-xs text-muted-foreground mt-1">Recommended: Square JPG, PNG. Max 2MB.</p>
                                        </div>
                                        <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                                        <div className="flex items-center justify-center sm:justify-start gap-3 pt-1">
                                            <Button type="button" size="sm" variant="secondary" className="font-medium shadow-sm hover:bg-muted" onClick={() => document.getElementById("avatar-upload")?.click()}>
                                                Upload Photo
                                            </Button>
                                            {displayImage && (
                                                <Button type="button" size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive font-medium" onClick={handleRemoveAvatar}>
                                                    <Trash2 className="size-4 mr-2" /> Remove
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Island 2: Form Fields */}
                                <div className="p-6 rounded-2xl bg-muted/40 border border-border/50 shadow-sm space-y-6">
                                    <FormField
                                        control={profileForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-semibold">Full Name</FormLabel>
                                                <FormControl>
                                                    <Input {...field} className="h-12 bg-background border-border/50 focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid gap-2">
                                        <Label className="font-semibold">Email Address</Label>
                                        <Input
                                            type="email"
                                            value={user?.email || ""}
                                            readOnly
                                            className="h-12 bg-muted border-border/50 text-muted-foreground cursor-not-allowed rounded-xl"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Your email address is bound to your account and cannot be changed.
                                        </p>
                                        <input type="email" name="username" value={user?.email || ""} autoComplete="username" className="hidden" readOnly />
                                    </div>
                                </div>

                                {/* Submit Area */}
                                <div className="pt-2 mt-auto">
                                    <Button
                                        type="submit"
                                        className="h-12 w-full sm:w-auto px-10 rounded-xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98]"
                                        disabled={isUpdatingProfile || isPending}
                                    >
                                        {isUpdatingProfile ? (
                                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving Changes...</>
                                        ) : "Save Profile Changes"}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>

                    {/* ================= RIGHT PANEL: SECURITY ================= */}
                    <div className="bg-card/60 backdrop-blur-2xl border border-border/50 rounded-4xl p-6 sm:p-10 shadow-xl relative overflow-hidden flex flex-col h-full">
                        {/* Top Gradient Line */}
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-indigo-500 to-purple-500 opacity-80" />

                        <div className="mb-8">
                            <h2 className="text-2xl font-bold">Account Security</h2>
                            <p className="text-sm text-muted-foreground mt-1.5">Ensure your account is using a strong password.</p>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handlePasswordChange)} className="flex flex-col flex-1 gap-6">

                                <input type="email" name="username" value={user?.email || ""} autoComplete="username" className="hidden" readOnly />

                                {error && (
                                    <Alert variant="destructive" className="rounded-xl bg-destructive/10 border-destructive/20 text-destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription className="font-medium">{error.message}</AlertDescription>
                                    </Alert>
                                )}

                                {/* Island 1: Current Password */}
                                <div className="p-6 rounded-2xl bg-muted/40 border border-border/50 shadow-sm">
                                    <FormField
                                        control={form.control}
                                        name="currentPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-semibold">Current Password</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        autoComplete="current-password"
                                                        className="h-12 bg-background border-border/50 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Island 2: New Password Fields */}
                                <div className="p-6 rounded-2xl bg-muted/40 border border-border/50 shadow-sm space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="newPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-semibold">New Password</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        autoComplete="new-password"
                                                        className="h-12 bg-background border-border/50 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-semibold">Confirm New Password</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        autoComplete="new-password"
                                                        className="h-12 bg-background border-border/50 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Submit Area */}
                                <div className="pt-2 mt-auto">
                                    <Button
                                        type="submit"
                                        className="h-12 w-full sm:w-auto px-10 rounded-xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98]"
                                        disabled={isPending || isChangingPassword}
                                    >
                                        {isPending || isChangingPassword ? (
                                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Updating Security...</>
                                        ) : "Update Password"}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;