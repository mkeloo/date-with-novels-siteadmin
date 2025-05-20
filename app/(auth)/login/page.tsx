"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { authClient } from "@/lib/auth-client";

export default function AdminLogin() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Google login only!
    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);

        try {
            // This will trigger a redirect; middleware will protect /dashboard for admin only.
            await authClient.signIn.social({ provider: "google" });

        } catch (err: any) {
            setError("Sign in failed.");
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-900">
            <form
                className="p-8 border-2 border-muted/80 rounded-xl shadow-lg bg-black flex flex-col items-center gap-5 min-w-[320px] max-w-sm w-full"
                onSubmit={e => e.preventDefault()}
            >
                <h1 className="text-3xl font-bold mb-4 text-center text-white">Admin Login</h1>
                {error && (
                    <p className="text-red-500 bg-red-200 p-2 rounded-md text-center w-full">{error}</p>
                )}
                <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 px-4 text-[1.06rem] font-bold shadow-md shadow-blue-500/20 bg-gradient-to-r from-blue-600/40 via-blue-800/40 to-cyan-600/40 text-white rounded-xl flex items-center justify-center gap-3 transition-all duration-150 hover:from-sky-500/90 hover:via-blue-500/90 hover:to-cyan-500/90 hover:scale-105 hover:shadow-lg active:scale-95 border-none"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                >
                    <div className="flex items-center justify-center p-1 bg-white rounded-lg shadow-md shadow-gray-300">
                        <FcGoogle className="!w-6 !h-6" />
                    </div>
                    {loading ? "Signing in..." : "Sign in with Google"}
                </Button>
            </form>
        </div>
    );
}