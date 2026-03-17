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
import { useForgotPasswordMutation } from "@/hooks/use-auth";
import { forgotPasswordSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle, Loader2, Layout, Mail, ShieldCheck, Key } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { toast } from "sonner";
import type { z } from "zod";

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
    const [isSuccess, setIsSuccess] = useState(false);

    const { mutate: forgotPassword, isPending } = useForgotPasswordMutation();

    const form = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = (data: ForgotPasswordFormData) => {
        forgotPassword(data, {
            onSuccess: () => {
                setIsSuccess(true);
            },
            onError: (error: any) => {
                const errorMessage = error.response?.data?.message;
                console.log(error);
                toast.error(errorMessage);
            },
        });
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
                    <div className="absolute top-[-20%] left-[10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen" />
                </div>

                {/* Subtle Dot Matrix Pattern */}
                <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.03)_2px,transparent_2px),linear-gradient(90deg,rgba(255,255,255,0.03)_2px,transparent_2px)] bg-size-[32px_32px] mask-[radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)] opacity-50" />

                {/* === CENTRAL GLASS COMPOSITION (Security Concept) === */}
                <div className="relative z-20 w-full max-w-[480px] mx-auto">

                    {/* Glowing Aura behind main card */}
                    <div className="absolute inset-0 bg-linear-to-tr from-blue-500 to-indigo-500 rounded-3xl blur-3xl opacity-20 transform -rotate-6" />

                    {/* Main Mockup Card */}
                    <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 p-10 flex flex-col items-center justify-center text-center gap-6 overflow-hidden">

                        {/* Background glowing rings */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-white/5 rounded-full animate-[spin_20s_linear_infinite]" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border border-white/5 rounded-full animate-[spin_15s_linear_infinite_reverse]" />

                        {/* Central Icon */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500 blur-xl opacity-40 rounded-full" />
                            <div className="relative w-24 h-24 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl border border-blue-400/30 transform rotate-3">
                                <ShieldCheck className="size-12 text-white" />
                            </div>

                            {/* Floating secondary icons */}
                            <div className="absolute -top-4 -right-6 w-12 h-12 bg-slate-800 border border-white/10 rounded-xl flex items-center justify-center shadow-lg transform -rotate-12 animate-[bounce_4s_infinite] delay-100">
                                <Mail className="size-5 text-blue-400" />
                            </div>
                            <div className="absolute -bottom-4 -left-6 w-12 h-12 bg-slate-800 border border-white/10 rounded-xl flex items-center justify-center shadow-lg transform rotate-12 animate-[bounce_5s_infinite] delay-300">
                                <Key className="size-5 text-indigo-400" />
                            </div>
                        </div>

                        {/* Abstract text lines */}
                        <div className="space-y-3 w-full max-w-[200px] mt-4">
                            <div className="h-3 w-full bg-white/20 rounded-full" />
                            <div className="h-3 w-3/4 bg-white/10 rounded-full mx-auto" />
                        </div>
                    </div>

                    {/* Floating Notification Badge */}
                    <div className="absolute -right-12 bottom-12 bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-4 hover:-translate-y-1 transition-transform cursor-default">
                        <div className="bg-green-500/20 p-2.5 rounded-full border border-green-500/30">
                            <CheckCircle className="size-5 text-green-400" />
                        </div>
                        <div>
                            <p className="text-white text-sm font-semibold">Secure Connection</p>
                            <p className="text-slate-400 text-xs">End-to-end encrypted</p>
                        </div>
                    </div>

                    {/* Bottom Marketing Text */}
                    <div className="absolute -bottom-28 left-0 right-0 text-center">
                        <h3 className="text-2xl font-bold text-white mb-2">Account Recovery</h3>
                        <p className="text-slate-400 text-sm">Get back to your workspace securely and instantly.</p>
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

                    {/* Dynamic Header based on state */}
                    <div className={`mb-10 ${isSuccess ? "text-center" : "text-center lg:text-left"}`}>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                            {isSuccess ? "Check your email" : "Forgot Password"}
                        </h2>
                        <p className="text-muted-foreground mt-3 text-sm sm:text-base">
                            {isSuccess
                                ? "We've sent a password reset link to your email."
                                : "Enter your email and we'll send you a link to reset your password"}
                        </p>
                    </div>

                    {isSuccess ? (
                        /* Success State UI */
                        <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mb-8 border border-green-200 dark:border-green-500/30 shadow-sm">
                                <Mail className="w-10 h-10 text-green-600 dark:text-green-400" />
                            </div>
                            <Link to="/sign-in" className="w-full max-w-sm">
                                <Button className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 rounded-xl transition-all">
                                    Return to Sign In
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        /* Form UI */
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(onSubmit)}
                                    className="space-y-6"
                                >
                                    <FormField
                                        name="email"
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-foreground/90 font-medium">Email Address</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="email"
                                                        className="h-12 bg-muted/30 border-border/50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent transition-all"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 rounded-xl transition-all active:scale-[0.98]"
                                        disabled={isPending}
                                    >
                                        {isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Sending link...
                                            </>
                                        ) : (
                                            "Send Reset Link"
                                        )}
                                    </Button>
                                </form>
                            </Form>

                            {/* Back to sign in link (Beautiful Pill Style) */}
                            <div className="mt-8 flex justify-center w-full">
                                <Link
                                    to="/sign-in"
                                    className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-blue-600 bg-muted/40 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 px-6 py-2.5 rounded-full transition-all duration-300 group"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                                    Back to sign in
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;