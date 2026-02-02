import { api } from "@/lib/fetch-util";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

export default function InvitationAccept() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const token = params.get("token");
    const [loading, setLoading] = useState(false); // Start false, wait for click

    const handleAccept = async () => {
        if (!token) return;

        setLoading(true);
        try {
            const res = await api.post(
                "/workspaces/accept-invite-token",
                { token }
            );

            // 🔐 Not logged in - Redirect to Sign In
            if (res.data.requiresAuth) {
                localStorage.setItem("inviteToken", token);
                navigate("/sign-in", { replace: true });
                return;
            }

            // ✅ Joined workspace successfully
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

    // ❌ REMOVED: The useEffect that was auto-triggering handleAccept()

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="w-full max-w-md rounded-lg border p-6 text-center">
                <h2 className="text-xl font-semibold">Workspace Invitation</h2>

                <div className="mt-4">
                    <p className="text-gray-600">
                        You have been invited to join a workspace.
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        Click accept to proceed.
                    </p>
                </div>

                <div className="mt-6 flex justify-center gap-4">
                    <button
                        onClick={handleAccept}
                        disabled={loading}
                        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Joining..." : "Accept Invitation"}
                    </button>

                    <button
                        onClick={() => navigate("/dashboard")}
                        disabled={loading}
                        className="rounded border px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}