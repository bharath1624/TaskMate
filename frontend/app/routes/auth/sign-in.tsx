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
import { useLoginMutation } from "@/hooks/use-auth";
import { signInSchema } from "@/lib/schema";
import { useAuth } from "@/provider/auth-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Layout, Eye, EyeOff } from "lucide-react"; // Added Eye and EyeOff
import { useState } from "react"; // Added useState
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

type SigninFormData = z.infer<typeof signInSchema>;

const SignIn = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    // State to toggle password visibility
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<SigninFormData>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const { mutate, isPending } = useLoginMutation();

    const handleOnSubmit = (values: SigninFormData) => {
        mutate(values, {
            onSuccess: async (data: any) => {
                await login(data);
                toast.success("Welcome back!");
                navigate("/dashboard");
            },
            onError: (error: any) => {
                const errorMessage = error.response?.data?.message || "Login failed";
                toast.error(errorMessage);
            },
        });
    };

    return (
        <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

            {/* ================= LEFT SIDE: THEME-AWARE VISUAL ARTWORK ================= */}
            <div className="hidden lg:flex relative w-1/2 items-center justify-center overflow-hidden">
                {/* Logo top left */}
                <div className="absolute top-10 left-10 z-30 flex items-center gap-3">
                    <div className="bg-linear-to-br from-blue-500 to-blue-700 p-2.5 rounded-xl shadow-lg shadow-blue-600/30 border border-blue-400/20">
                        <Layout className="size-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">TaskMate</span>
                </div>

                {/* Mesh Gradient Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[10%] left-[-20%] w-[70%] h-[70%] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
                </div>

                {/* Subtle Dot Matrix Pattern */}
                <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(0,0,0,0.05)_2px,transparent_2px),linear-gradient(90deg,rgba(0,0,0,0.05)_2px,transparent_2px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_2px,transparent_2px),linear-gradient(90deg,rgba(255,255,255,0.03)_2px,transparent_2px)] bg-size-[32px_32px] mask-[radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)] opacity-50" />

                {/* === CENTRAL GLASS COMPOSITION === */}
                <div className="relative z-20 w-full max-w-[480px] mx-auto">
                    <div className="absolute inset-0 bg-linear-to-br from-indigo-500 to-blue-600 rounded-3xl blur-3xl opacity-30 dark:opacity-20 transform rotate-2" />
                    <div className="relative bg-white/70 dark:bg-white/5 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl shadow-slate-300/50 dark:shadow-black/50 p-8 flex flex-col gap-6">

                        {/* Profile Header Skeleton */}
                        <div className="flex items-center gap-5 border-b border-slate-200 dark:border-white/10 pb-6">
                            <div className="size-16 rounded-full bg-linear-to-tr from-blue-500 to-indigo-500 p-1">
                                <div className="size-full rounded-full bg-white dark:bg-slate-900 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                                    <div className="size-8 bg-slate-200 dark:bg-white/20 rounded-full" />
                                </div>
                            </div>
                            <div className="space-y-2.5">
                                <div className="h-5 w-40 bg-slate-200 dark:bg-white/20 rounded-md" />
                                <div className="h-3 w-24 bg-slate-200 dark:bg-white/10 rounded-md" />
                            </div>
                        </div>

                        {/* Weekly Progress Skeleton */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="h-4 w-32 bg-slate-200 dark:bg-white/10 rounded-md" />
                                <div className="h-4 w-12 bg-blue-500/50 rounded-md" />
                            </div>
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <div className="flex justify-between">
                                        <div className="h-2 w-20 bg-slate-200 dark:bg-white/10 rounded" />
                                        <div className="h-2 w-8 bg-slate-200 dark:bg-white/10 rounded" />
                                    </div>
                                    <div className="h-2 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full w-[75%] bg-blue-500 rounded-full" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex justify-between">
                                        <div className="h-2 w-24 bg-slate-200 dark:bg-white/10 rounded" />
                                        <div className="h-2 w-8 bg-slate-200 dark:bg-white/10 rounded" />
                                    </div>
                                    <div className="h-2 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full w-[45%] bg-indigo-500 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Mini-cards */}
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="h-20 bg-white/60 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 flex flex-col justify-center p-4 gap-2 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors">
                                <div className="h-6 w-8 bg-slate-300 dark:bg-white/20 rounded-md" />
                                <div className="h-3 w-20 bg-slate-200 dark:bg-white/10 rounded-md" />
                            </div>
                            <div className="h-20 bg-white/60 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 flex flex-col justify-center p-4 gap-2 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors">
                                <div className="h-6 w-12 bg-slate-300 dark:bg-white/20 rounded-md" />
                                <div className="h-3 w-24 bg-slate-200 dark:bg-white/10 rounded-md" />
                            </div>
                        </div>
                    </div>

                    {/* Floating Notification Badge */}
                    <div className="absolute -left-10 top-32 bg-white/90 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-4 animate-[bounce_5s_infinite] hover:animate-none transition-all cursor-default delay-150">
                        <div className="bg-blue-500/20 p-2.5 rounded-full border border-blue-500/30">
                            <svg className="size-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        </div>
                        <div>
                            <p className="text-slate-900 dark:text-white text-sm font-semibold">3 New Updates</p>
                            <p className="text-slate-500 dark:text-slate-400 text-xs">While you were away</p>
                        </div>
                    </div>

                    {/* Bottom Marketing Text */}
                    <div className="absolute -bottom-24 left-0 right-0 text-center">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Pick up where you left off</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Sign in to access your Projects and Tasks</p>
                    </div>

                </div>
            </div>

            {/* ================= RIGHT SIDE: FORM ================= */}
            <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 lg:w-1/2 relative">

                {/* Mobile Logo */}
                <div className="absolute top-8 left-6 lg:hidden flex items-center gap-2">
                    <div className="bg-blue-600 p-1.5 rounded-md shadow-md">
                        <Layout className="size-5 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground">TaskMate</span>
                </div>

                <div className="mx-auto w-full max-w-sm lg:max-w-md">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">Welcome back</h2>
                        <p className="text-muted-foreground mt-3 text-sm sm:text-base">
                            Sign in to your account to continue.
                        </p>
                    </div>

                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handleOnSubmit)}
                            className="space-y-6"
                        >
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-foreground/90 font-medium">Email Address</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                className="h-12 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent transition-all"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <FormLabel className="text-foreground/90 font-medium">Password</FormLabel>
                                            <Link
                                                to="/forgot-password"
                                                className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                                            >
                                                Forgot password?
                                            </Link>
                                        </div>

                                        {/* ✅ FIX: The relative div is now OUTSIDE the FormControl */}
                                        <div className="relative">
                                            <FormControl>
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    className="h-12 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent transition-all pr-10"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="size-5" />
                                                ) : (
                                                    <Eye className="size-5" />
                                                )}
                                            </button>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                disabled={isPending}
                                className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] mt-2 rounded-xl"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    "Sign in"
                                )}
                            </Button>
                        </form>
                    </Form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-muted-foreground">
                            Don&apos;t have an account?{" "}
                            <Link
                                to="/sign-up"
                                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignIn;