import { api } from "@/lib/fetch-util";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Building2, Loader2, Sparkles } from "lucide-react";

export default function InvitationAccept() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const token = params.get("token");
    const [loading, setLoading] = useState(false);

    // ✅ State to hold the real workspace name
    const [workspaceName, setWorkspaceName] = useState("the workspace");

    // ✅ Decode the token when the page loads to extract the workspace name
    useEffect(() => {
        if (token) {
            try {
                // JWTs have 3 parts separated by dots. The middle part is the data payload.
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                const payloadData = JSON.parse(jsonPayload);

                if (payloadData.workspaceName) {
                    setWorkspaceName(payloadData.workspaceName);
                }
            } catch (e) {
                console.error("Could not decode token for workspace name", e);
            }
        }
    }, [token]);

    const handleAccept = async () => {
        if (!token) return;

        setLoading(true);
        try {
            const res = await api.post(
                "/workspaces/accept-invite-token",
                { token }
            );

            if (res.data.requiresAuth) {
                localStorage.setItem("inviteToken", token);
                navigate("/sign-in", { replace: true });
                return;
            }

            if (res.data.joined && res.data.workspaceId) {
                localStorage.removeItem("inviteToken");
                navigate(`/workspaces/${res.data.workspaceId}`, { replace: true });
            }

        } catch (err: any) {
            console.error(err);
            if (err.response?.status !== 404) {
                alert("Invalid or expired invitation");
            }
            navigate("/dashboard");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden px-4">

            {/* ================= THEME-AWARE BACKGROUND EFFECTS ================= */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-[120px] mix-blend-normal" />
                <div className="absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-[120px] mix-blend-normal" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_2px,transparent_2px),linear-gradient(90deg,rgba(0,0,0,0.03)_2px,transparent_2px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_2px,transparent_2px),linear-gradient(90deg,rgba(255,255,255,0.02)_2px,transparent_2px)] bg-size-[32px_32px] mask-[radial-gradient(ellipse_60%_60%_at_50%_50%,#000_40%,transparent_100%)] opacity-100" />
            </div>

            {/* ================= INVITATION CARD ================= */}
            <div className="relative z-10 w-full max-w-lg animate-in fade-in zoom-in-95 duration-500">
                <div className="bg-card/60 backdrop-blur-2xl border border-border/50 rounded-4xl shadow-2xl p-8 sm:p-12 text-center overflow-hidden">

                    <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-blue-500 to-indigo-500 opacity-80" />

                    <div className="relative mx-auto w-20 h-20 mb-8">
                        <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping opacity-20" />
                        <div className="relative flex items-center justify-center w-full h-full bg-linear-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-full shadow-inner">
                            <Building2 className="size-8 text-blue-600 dark:text-blue-400" />
                            <div className="absolute -top-1 -right-1 bg-background rounded-full p-1 shadow-sm border border-border/50">
                                <Sparkles className="size-3 text-yellow-500" />
                            </div>
                        </div>
                    </div>

                    <h2 className="text-3xl font-extrabold tracking-tight text-foreground mb-3">
                        Workspace Invitation
                    </h2>
                    <p className="text-muted-foreground mb-8 text-sm sm:text-base leading-relaxed max-w-sm mx-auto">
                        {/* ✅ Displaying the real workspace name dynamically! */}
                        You have been invited to join <strong>{workspaceName}</strong>.<br></br>
                        Accept invitation to access projects, tasks and team discussions.
                    </p>

                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={handleAccept}
                            disabled={loading}
                            className="h-12 w-full rounded-xl text-base font-semibold bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Joining Workspace...
                                </>
                            ) : (
                                "Accept Invitation"
                            )}
                        </Button>

                        <Button
                            onClick={() => navigate("/")}
                            disabled={loading}
                            variant="ghost"
                            className="h-12 w-full rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                        >
                            Decline
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}