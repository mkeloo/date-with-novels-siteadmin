import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL!,
})

// Helper function for sign out
export async function signOut() {
    await authClient.signOut();
}