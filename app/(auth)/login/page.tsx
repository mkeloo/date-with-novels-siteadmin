"use client";
import React, { startTransition, useActionState, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { signIn, signInWithGoogle } from "../../actions/auth";

async function signInAction(
    prevState: { error: string } | null,
    formData: FormData
) {
    return await signIn(prevState, formData);
}

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [state, formAction] = useActionState(signInAction, null);
    const [email, setEmail] = useState("");

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === "admin") {
            setEmail("admin@siteadmin.com");
        } else {
            setEmail(value);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        setIsLoading(true);
        // allow default action behavior to proceed (trigger useActionState)
    };

    // Stop loading when error state changes (or success, depending on your auth flow)
    useEffect(() => {
        if (state) {
            setIsLoading(false);
        }
    }, [state]);


    const handleGoogleLogin = () => {
        startTransition(async () => {
            await signInWithGoogle();
        })
    }


    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-900">
            <form
                action={formAction}
                onSubmit={handleSubmit}
                className="p-8 border-2 border-muted/80 rounded-xl shadow-lg w-100 h-40 bg-black"
            >
                <h1 className="text-3xl font-bold mb-4 text-center">Admin Login</h1>
                <Button
                    type="button"
                    variant="outline"
                    className="w-full text-base font-semibold border-2 !border-white shadow-md shadow-amber-100 bg-gradient-to-tr from-blue-500 via-green-700 to-cyan-500 text-white hover:scale-105 transition-transform duration-300 ease-in-out"
                    onClick={handleGoogleLogin}
                >
                    Login
                </Button>


                {/* Email / Password */}
                {/* <div className="space-y-4">
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={email}
                            onChange={handleEmailChange}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" required />
                    </div>


                    {state?.error && (
                        <p className="text-red-700 bg-red-200 p-2 rounded-md text-center">
                            {state.error}
                        </p>
                    )}
                    <Button loading={isLoading} type="submit" className="w-full">
                        Log In
                    </Button>
                </div> */}
            </form>
        </div>
    );
}