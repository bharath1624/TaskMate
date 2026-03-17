import { Button } from "@/components/ui/button";
import { useVerifyEmailMutation } from "@/hooks/use-auth";
import { CheckCircle, Loader2, XCircle, Layout, Mail } from 'lucide-react';
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
    }, [searchParams]);

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden px-4">

            {/* ================= BACKGROUND EFFECTS ================= */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full mix-blend-screen" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_2px,transparent_2px),linear-gradient(90deg,rgba(255,255,255,0.02)_2px,transparent_2px)] bg-size-[32px_32px] mask-[radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)] opacity-50 dark:bg-[linear-gradient(rgba(255,255,255,0.03)_2px,transparent_2px)]" />
            </div>

            {/* ================= VERIFICATION CARD ================= */}
            <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
                <div className="bg-white/5 backdrop-blur-2xl border border-border/50 rounded-3xl shadow-2xl p-8 sm:p-10 flex flex-col items-center text-center overflow-hidden relative">

                    {/* Subtle top gradient line for depth */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-80" />

                    {/* App Logo */}
                    <div className="flex items-center gap-2 mb-10">
                        <div className="bg-linear-to-br from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-600/20">
                            <Layout className="size-5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-foreground">TaskMate</span>
                    </div>

                    {/* ================= DYNAMIC STATES ================= */}
                    <div className="w-full flex flex-col items-center min-h-[220px] justify-center">

                        {isVerifying ? (
                            /* --------- LOADING STATE --------- */
                            <div className="flex flex-col items-center animate-in fade-in duration-500">
                                <div className="relative w-20 h-20 flex items-center justify-center mb-6">
                                    <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-blue-500 animate-[spin_1.5s_linear_infinite]" />
                                    <div className="absolute inset-2 rounded-full border-b-2 border-l-2 border-indigo-400 animate-[spin_2s_linear_infinite_reverse]" />
                                    <div className="bg-blue-500/10 p-3 rounded-full">
                                        <Mail className="size-8 text-blue-500 animate-pulse" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold tracking-tight mb-2 text-foreground">Verifying Email</h3>
                                <p className="text-sm text-muted-foreground">
                                    Please wait while we securely verify your email address...
                                </p>
                            </div>

                        ) : isSuccess ? (
                            /* --------- SUCCESS STATE --------- */
                            <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
                                <div className="relative w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6 border border-green-500/20">
                                    <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping opacity-20" />
                                    <CheckCircle className="size-10 text-green-500" />
                                </div>
                                <h3 className="text-2xl font-bold tracking-tight mb-2 text-foreground">Email Verified!</h3>
                                <p className="text-sm text-muted-foreground mb-8">
                                    Your email has been successfully verified. You can now access your workspace.
                                </p>
                                <Link to="/sign-in" className="w-full">
                                    <Button className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 rounded-xl transition-all active:scale-[0.98]">
                                        Continue to Sign In
                                    </Button>
                                </Link>
                            </div>

                        ) : (
                            /* --------- ERROR STATE --------- */
                            <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
                                <div className="relative w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                                    <XCircle className="size-10 text-red-500" />
                                </div>
                                <h3 className="text-2xl font-bold tracking-tight mb-2 text-foreground">Verification Failed</h3>
                                <p className="text-sm text-muted-foreground mb-8">
                                    The verification link is invalid or has expired. Please request a new link.
                                </p>
                                <Link to="/sign-in" className="w-full">
                                    <Button variant="outline" className="w-full h-12 text-base font-semibold rounded-xl border-border/50 hover:bg-muted/50 transition-all">
                                        Back to Sign In
                                    </Button>
                                </Link>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}

export default VerifyEmail;