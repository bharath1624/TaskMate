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
import { useResetPasswordMutation } from "@/hooks/use-auth";
import { resetPasswordSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle, Loader2, Layout, LockKeyhole, ShieldCheck } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [isSuccess, setIsSuccess] = useState(false);
    const { mutate: resetPassword, isPending } = useResetPasswordMutation();

    const form = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
    });

    const onSubmit = (values: ResetPasswordFormData) => {
        if (!token) {
            toast.error("Invalid token");
            return;
        }

        resetPassword(
            { ...values, token: token as string },
            {
                onSuccess: () => {
                    setIsSuccess(true);
                },
                onError: (error: any) => {
                    const errorMessage =
                        error.response?.data?.message ||
                        "Reset link expired. Please request a new one.";

                    toast.error(errorMessage);

                    // 🔥 AUTO REDIRECT on expired / invalid token
                    if (
                        error.response?.status === 401 &&
                        errorMessage.toLowerCase().includes("expired")
                    ) {
                        setTimeout(() => {
                            navigate("/forgot-password");
                        }, 1500); // small delay so user can read toast
                    }
                },
            }
        );
    };

    return (
        <div className="min-h-screen w-full flex bg-background">

            {/* ================= LEFT SIDE: PREMIUM VISUAL ARTWORK ================= */}
            <div className="hidden lg:flex relative w-1/2 bg-slate-950 items-center justify-center overflow-hidden">

                {/* Logo top left */}
                <div className="absolute top-10 left-10 z-30 flex items-center gap-3">
                    <div className="bg-linear-to-br from-blue-500 to-blue-700 p-2.5 rounded-xl shadow-lg shadow-blue-600/30 border border-blue-400/20">
                        <Layout className="size-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-white">TaskMate</span>
                </div>

                {/* Mesh Gradient Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-10%] left-[20%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[70%] h-[70%] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen" />
                </div>

                {/* Subtle Dot Matrix Pattern */}
                <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.03)_2px,transparent_2px),linear-gradient(90deg,rgba(255,255,255,0.03)_2px,transparent_2px)] bg-size-[32px_32px] mask-[radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)] opacity-50" />

                {/* === CENTRAL GLASS COMPOSITION (New Password Concept) === */}
                <div className="relative z-20 w-full max-w-[480px] mx-auto">

                    {/* Glowing Aura behind main card */}
                    <div className="absolute inset-0 bg-linear-to-tr from-indigo-500 to-blue-500 rounded-3xl blur-3xl opacity-20 transform rotate-3" />

                    {/* Main Mockup Card */}
                    <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 p-10 flex flex-col items-center justify-center text-center gap-6 overflow-hidden">

                        {/* Background glowing rings */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] border border-white/5 rounded-full animate-[spin_15s_linear_infinite]" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] border border-white/10 rounded-full animate-[spin_20s_linear_infinite_reverse]" />

                        {/* Central Icon */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-40 rounded-full" />
                            <div className="relative w-24 h-24 bg-linear-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl border border-indigo-400/30 transform -rotate-3">
                                <LockKeyhole className="size-10 text-white" />
                            </div>

                            {/* Floating secondary icon */}
                            <div className="absolute -bottom-3 -right-5 w-12 h-12 bg-slate-800 border border-white/10 rounded-xl flex items-center justify-center shadow-lg transform rotate-12 animate-[bounce_4s_infinite] delay-150">
                                <ShieldCheck className="size-5 text-green-400" />
                            </div>
                        </div>

                        {/* Abstract password dots */}
                        <div className="flex gap-2 mt-4 bg-black/40 px-6 py-3 rounded-full border border-white/5">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <div key={i} className="w-2.5 h-2.5 rounded-full bg-white/80 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                            ))}
                        </div>
                    </div>

                    {/* Bottom Marketing Text */}
                    <div className="absolute -bottom-28 left-0 right-0 text-center">
                        <h3 className="text-2xl font-bold text-white mb-2">Secure your workspace</h3>
                        <p className="text-slate-400 text-sm">Choose a strong, unique password to protect your account.</p>
                    </div>

                </div>
            </div>

            {/* ================= RIGHT SIDE: FORM ================= */}
            <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 lg:w-1/2 bg-background relative">

                {/* Mobile Logo */}
                <div className="absolute top-8 left-6 lg:hidden flex items-center gap-2">
                    <div className="bg-blue-600 p-1.5 rounded-md shadow-md">
                        <Layout className="size-5 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground">TaskMate</span>
                </div>

                <div className="mx-auto w-full max-w-sm lg:max-w-md">

                    {/* Back to sign in link (Top) */}
                    {!isSuccess && (
                        <Link
                            to="/sign-in"
                            className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-blue-600 transition-colors group mb-8"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to sign in
                        </Link>
                    )}

                    {/* Dynamic Header based on state */}
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                            {isSuccess ? "Password updated" : "Reset Password"}
                        </h2>
                        <p className="text-muted-foreground mt-3 text-sm sm:text-base">
                            {isSuccess
                                ? "Your password has been successfully reset. You can now log in with your new credentials."
                                : "Please enter your new password below."}
                        </p>
                    </div>

                    {isSuccess ? (
                        /* --------- SUCCESS STATE UI --------- */
                        <div className="flex flex-col items-center lg:items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-center items-center">
                                <div className="w-20 h-20 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mb-8 border border-green-200 dark:border-green-500/30">
                                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                            <Link to="/sign-in" className="w-full">
                                <Button className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 rounded-xl transition-all">
                                    Proceed to Sign In
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        /* --------- FORM UI --------- */
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(onSubmit)}
                                    className="space-y-6"
                                >
                                    <FormField
                                        name="newPassword"
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-foreground/90 font-medium">New Password</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="password"
                                                        className="h-12 bg-muted/30 border-border/50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent transition-all rounded-xl"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        name="confirmPassword"
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-foreground/90 font-medium">Confirm New Password</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="password"
                                                        className="h-12 bg-muted/30 border-border/50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent transition-all rounded-xl"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 rounded-xl transition-all active:scale-[0.98] mt-2"
                                        disabled={isPending}
                                    >
                                        {isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Resetting password...
                                            </>
                                        ) : (
                                            "Confirm"
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;