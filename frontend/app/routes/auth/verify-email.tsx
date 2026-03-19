import { Button } from "@/components/ui/button";
import { useVerifyEmailMutation } from "@/hooks/use-auth";
import { CheckCircle2, Loader2, XCircle, Layout, MailOpen, ShieldAlert } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { toast } from "sonner";

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();

    const token = searchParams.get("token");
    const [isSuccess, setIsSuccess] = useState(false);
    const { mutate, isPending: isVerifying } = useVerifyEmailMutation();

    useEffect(() => {
        if (token) {
            mutate(
                { token },
                {
                    onSuccess: () => {
                        setIsSuccess(true);
                    },
                    onError: (error: any) => {
                        const errorMessage =
                            error.response?.data?.message || "An error occurred";
                        setIsSuccess(false);
                        console.log(error);

                        toast.error(errorMessage);
                    }
                }
            )
            setIsSuccess(false);
        }
    }, [searchParams, mutate]); // Included mutate in dependency array for best practices

    return (
        <div className="min-h-screen w-full flex flex-col bg-background relative overflow-hidden">

            {/* ================= CINEMATIC BACKGROUND EFFECTS ================= */}
            {/* Top Spotlight */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-600/20 via-indigo-900/5 to-transparent opacity-80 pointer-events-none" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_60%_at_50%_0%,#000_20%,transparent_100%)] pointer-events-none" />

            {/* ================= TOP NAVIGATION ================= */}
            <header className="w-full relative z-20 px-6 py-6 sm:px-12 flex justify-center sm:justify-start">
                <div className="flex items-center gap-2.5">
                    <div className="bg-linear-to-br from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-600/20 border border-blue-500/20">
                        <Layout className="size-5 text-white" />
                    </div>
                    <span className="text-2xl font-extrabold tracking-tight text-foreground">TaskMate</span>
                </div>
            </header>

            {/* ================= MAIN CONTENT AREA ================= */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10 pb-20">
                <div className="w-full max-w-2xl mx-auto flex flex-col items-center text-center">

                    {isVerifying ? (
                        /* --------- LOADING STATE (Digital Scan Effect) --------- */
                        <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-700">
                            <div className="relative w-32 h-32 mb-10 flex items-center justify-center">
                                {/* Scanning Rings */}
                                <div className="absolute inset-0 rounded-full border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.2)]" />
                                <div className="absolute -inset-2.5 rounded-full border-t-2 border-r-2 border-blue-500 animate-[spin_2s_linear_infinite]" />
                                <div className="absolute -inset-5 rounded-full border-b-2 border-l-2 border-indigo-500/50 animate-[spin_3s_linear_infinite_reverse]" />

                                {/* Center Icon */}
                                <div className="absolute bg-background/80 backdrop-blur-sm rounded-full p-4 border border-border">
                                    <MailOpen className="size-10 text-blue-500 animate-pulse" />
                                </div>
                            </div>

                            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
                                Verifying Identity
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-md mx-auto">
                                Establishing a secure connection to authenticate your email address. Please hold on...
                            </p>
                        </div>

                    ) : isSuccess ? (
                        /* --------- SUCCESS STATE (Hero Celebration) --------- */
                        <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700 w-full">
                            {/* Glowing Success Icon */}
                            <div className="relative mb-10 group">
                                <div className="absolute inset-0 bg-green-500 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 animate-pulse" />
                                <div className="relative bg-linear-to-b from-green-400 to-green-600 p-1 rounded-full shadow-2xl">
                                    <div className="bg-background rounded-full p-5">
                                        <CheckCircle2 className="size-16 text-green-500" />
                                    </div>
                                </div>
                            </div>

                            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
                                Verification Complete
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-md mx-auto mb-10">
                                Your email has been successfully secured. You now have full access to your TaskMate workspace.
                            </p>

                            <Link to="/sign-in" className="w-full max-w-sm">
                                <Button className="w-full h-14 text-lg font-bold bg-foreground text-background hover:bg-foreground/90 hover:scale-[1.02] active:scale-[0.98] shadow-2xl transition-all rounded-2xl">
                                    Access Workspace
                                </Button>
                            </Link>
                        </div>

                    ) : (
                        /* --------- ERROR STATE (Warning Focus) --------- */
                        <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700 w-full">
                            {/* Glowing Error Icon */}
                            <div className="relative mb-10">
                                <div className="absolute inset-0 bg-red-500 rounded-full blur-2xl opacity-30" />
                                <div className="relative bg-linear-to-b from-red-400 to-red-600 p-1 rounded-full shadow-2xl">
                                    <div className="bg-background rounded-full p-5">
                                        <ShieldAlert className="size-16 text-red-500" />
                                    </div>
                                </div>
                            </div>

                            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
                                Link Expired
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-md mx-auto mb-10">
                                The verification link is invalid or has timed out for security purposes. Please request a new link.
                            </p>

                            <Link to="/sign-in" className="w-full max-w-sm">
                                <Button variant="outline" className="w-full h-14 text-lg font-bold border-2 border-border hover:bg-muted hover:text-foreground transition-all rounded-2xl">
                                    Return to Sign In
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default VerifyEmail;