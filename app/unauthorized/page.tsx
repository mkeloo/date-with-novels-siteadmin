"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client"; // <-- BetterAuth signOut
import { Ghost } from "lucide-react";

export default function UnauthorizedPage() {
    const [clickCount, setClickCount] = useState(0);
    const router = useRouter();

    useEffect(() => {
        if (clickCount >= 5) {
            const logout = async () => {
                await signOut();
                router.push("/");
            };

            logout();
            // Reset the click counter after triggering logout
            setClickCount(0);
        }
    }, [clickCount, router]);

    const handleSecretClick = () => {
        setClickCount((prev) => prev + 1);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen space-y-4 p-4">
            <Ghost
                onClick={handleSecretClick}
                className="w-28 h-28 text-foreground/80 cursor-pointer hover:opacity-70 transition animate-pulse"
            />

            <h1 className="text-2xl font-semibold text-red-500 text-center px-4 shimmer">
                You do not have permission to access this site.
            </h1>
        </div>
    );
}