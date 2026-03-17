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
import { useSignUpMutation } from "@/hooks/use-auth";
import { signUpSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Layout } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

export type SignupFormData = z.infer<typeof signUpSchema>;

const SignUp = () => {
    const navigate = useNavigate();
    const form = useForm<SignupFormData>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const { mutate, isPending } = useSignUpMutation();

    const handleOnSubmit = (values: SignupFormData) => {
        mutate(values, {
            onSuccess: () => {
                toast.success("Email Verification Required", {
                    description:
                        "Please verify your email, then sign in to continue.",
                });

                // 🔐 IMPORTANT: DO NOT remove inviteToken here
                // It will be used after login

                form.reset();
                navigate("/sign-in");
            },

            onError: (error: any) => {
                const errorMessage =
                    error.response?.data?.message || "An error occurred";
                console.log(error);
                toast.error(errorMessage);
            },
        });
    }

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
                    <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen" />
                </div>

                {/* Subtle Dot Matrix Pattern */}
                <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.03)_2px,transparent_2px),linear-gradient(90deg,rgba(255,255,255,0.03)_2px,transparent_2px)] bg-size-[32px_32px] mask-[radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)] opacity-50" />

                {/* === CENTRAL GLASS COMPOSITION === */}
                <div className="relative z-20 w-full max-w-[520px] mx-auto">

                    {/* Glowing Aura behind main card */}
                    <div className="absolute inset-0 bg-linear-to-tr from-blue-600 to-indigo-500 rounded-3xl blur-3xl opacity-20 transform -rotate-3" />

                    {/* Main Mockup Card */}
                    <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden aspect-4/3 flex flex-col">

                        {/* Browser/App Header */}
                        <div className="h-12 bg-white/5 border-b border-white/10 flex items-center px-4 gap-4">
                            <div className="flex gap-1.5">
                            </div>
                            <div className="h-5 w-48 bg-white/5 rounded-md border border-white/5 mx-auto" />
                        </div>

                        {/* App Content Area */}
                        <div className="flex-1 p-6 flex gap-6">
                            {/* Sidebar Skeleton */}
                            <div className="w-1/4 flex flex-col gap-4 border-r border-white/5 pr-6">
                                <div className="h-4 w-full bg-white/10 rounded" />
                                <div className="h-3 w-3/4 bg-white/5 rounded" />
                                <div className="h-3 w-5/6 bg-white/5 rounded" />
                                <div className="h-3 w-4/5 bg-white/5 rounded" />
                                <div className="mt-auto h-8 w-full bg-blue-600/20 border border-blue-500/30 rounded-lg" />
                            </div>

                            {/* Main Activity Skeleton */}
                            <div className="flex-1 flex flex-col gap-5">
                                {/* Header block */}
                                <div className="flex justify-between items-end">
                                    <div className="space-y-2">
                                        <div className="h-5 w-32 bg-white/10 rounded" />
                                        <div className="h-3 w-20 bg-white/5 rounded" />
                                    </div>
                                    <div className="flex -space-x-2">
                                        <div className="size-8 rounded-full border-2 border-slate-900 bg-indigo-500" />
                                        <div className="size-8 rounded-full border-2 border-slate-900 bg-blue-400" />
                                        <div className="size-8 rounded-full border-2 border-slate-900 bg-white/20 flex items-center justify-center text-[10px] text-white font-medium">+3</div>
                                    </div>
                                </div>

                                {/* Beautiful Chart Placeholder */}
                                <div className="h-32 w-full bg-linear-to-r from-blue-500/10 to-indigo-500/10 rounded-xl border border-white/5 flex items-end p-4 gap-3">
                                    <div className="w-full bg-white/10 rounded-t-sm h-[40%] hover:bg-white/20 transition-colors" />
                                    <div className="w-full bg-blue-500/40 rounded-t-sm h-[70%] hover:bg-blue-500/60 transition-colors" />
                                    <div className="w-full bg-indigo-500/60 rounded-t-sm h-[95%] shadow-[0_0_15px_rgba(99,102,241,0.4)]" />
                                    <div className="w-full bg-white/10 rounded-t-sm h-[50%] hover:bg-white/20 transition-colors" />
                                    <div className="w-full bg-blue-500/30 rounded-t-sm h-[80%] hover:bg-blue-500/50 transition-colors" />
                                </div>

                                {/* Tasks */}
                                <div className="space-y-3">
                                    <div className="h-12 w-full bg-white/5 hover:bg-white/10 transition-colors rounded-lg border border-white/5 flex items-center px-4 gap-4">
                                        <div className="size-5 rounded-full border border-blue-500/50" />
                                        <div className="flex-1 h-2.5 bg-white/20 rounded-full" />
                                        <div className="w-16 h-2 bg-white/5 rounded-full" />
                                    </div>
                                    <div className="h-12 w-full bg-white/5 hover:bg-white/10 transition-colors rounded-lg border border-white/5 flex items-center px-4 gap-4">
                                        <div className="size-5 rounded-full bg-blue-500 flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                                            <svg className="size-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <div className="flex-1 h-2.5 bg-white/10 rounded-full" />
                                        <div className="w-12 h-2 bg-white/5 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Floating Notification Badge */}
                    <div className="absolute -right-12 top-20 bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-4 animate-[bounce_4s_infinite] hover:animate-none transition-all cursor-default">
                        <div className="bg-green-500/20 p-2.5 rounded-full border border-green-500/30">
                            <svg className="size-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <p className="text-white text-sm font-semibold">John invited you</p>
                            <p className="text-slate-400 text-xs">Just now</p>
                        </div>
                    </div>

                    {/* Bottom Marketing Text */}
                    <div className="absolute -bottom-24 left-0 right-0 text-center">
                        <h3 className="text-2xl font-bold text-white mb-2">Supercharge your productivity</h3>
                        <p className="text-slate-400 text-sm">Join thousands of teams already using TaskMate</p>
                    </div>

                </div>
            </div>

            {/* ================= RIGHT SIDE: FORM (Untouched Logic) ================= */}
            <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 lg:w-1/2 bg-background relative">

                {/* Mobile Logo */}
                <div className="absolute top-8 left-6 lg:hidden flex items-center gap-2">
                    <div className="bg-blue-600 p-1.5 rounded-md shadow-md">
                        <Layout className="size-5 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground">TaskMate</span>
                </div>

                <div className="mx-auto w-full max-w-sm lg:max-w-md">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">Get Started</h2>
                        <p className="text-muted-foreground mt-3 text-sm sm:text-base">
                            Enter your details below to set up your account
                        </p>
                    </div>

                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handleOnSubmit)}
                            className="space-y-5"
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
                                                className="h-12 bg-muted/30 border-border/50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent transition-all"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-foreground/90 font-medium">Full Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                className="h-12 bg-muted/30 border-border/50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent transition-all"
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
                                        <FormLabel className="text-foreground/90 font-medium">Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                className="h-12 bg-muted/30 border-border/50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent transition-all"
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
                                        <FormLabel className="text-foreground/90 font-medium">Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                className="h-12 bg-muted/30 border-border/50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent transition-all"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] mt-4 rounded-xl"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    "Sign up"
                                )}
                            </Button>
                        </form>
                    </Form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link
                                to="/sign-in"
                                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                            >
                                Sign in instead
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;