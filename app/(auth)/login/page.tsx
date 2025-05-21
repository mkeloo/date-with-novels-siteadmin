"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { authClient } from "@/lib/auth-client";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Email/password login
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const result = await authClient.signIn.email({ email, password });
            if (result?.error) {
                setError(result.error.message || result.error.statusText || "Login failed.");
            } else {
                router.push("/dashboard/analytics/ga4-analytics");
            }
        } catch (err: any) {
            setError("Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };


    // Google login
    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);

        try {
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
                onSubmit={handleLogin}
            >
                <h1 className="text-3xl font-bold mb-4 text-center text-white">Admin Login</h1>
                {error && (
                    <p className="text-red-500 bg-red-200 p-2 rounded-md text-center w-full">{error}</p>
                )}
                <input
                    type="email"
                    placeholder="Email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 text-black border border-gray-300 focus:outline-none"
                />
                <input
                    type="password"
                    placeholder="Password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 text-black border border-gray-300 focus:outline-none"
                />
                <Button
                    type="submit"
                    className="w-full h-12 px-4 text-[1.06rem] font-bold shadow-md shadow-blue-500/20 bg-gradient-to-r from-blue-600/40 via-blue-800/40 to-cyan-600/40 text-white rounded-xl flex items-center justify-center gap-3 transition-all duration-150 hover:from-sky-500/90 hover:via-blue-500/90 hover:to-cyan-500/90 hover:scale-105 hover:shadow-lg active:scale-95 border-none"
                    disabled={loading}
                >
                    {loading ? "Signing in..." : "Sign in"}
                </Button>
                <div className="w-full flex items-center justify-center my-2 gap-2">
                    <span className="h-[1px] w-full bg-muted/40" />
                    <span className="text-xs text-muted-foreground px-1">OR</span>
                    <span className="h-[1px] w-full bg-muted/40" />
                </div>
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