"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";


// List of allowed admin emails
// const ADMIN_USERS = ["admin@siteadmin.com", "admin2@siteadmin.com"];

export async function signIn(
    prevState: { error: string } | null,
    formData: FormData
) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // // Check if the email is in the admin list
    // if (!ADMIN_USERS.includes(email)) {
    //     return { error: "Unauthorized access." };
    // }

    const supabase = await createClient();

    const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    const session = await supabase.auth.getSession();
    console.log("Refresh Token:", session.data?.session?.refresh_token);

    console.log(data, "data_login");

    if (error) {
        return { error: error.message };
    }

    redirect("/dashboard");
}

export async function signOut() {
    "use server";

    const supabase = await createClient();

    await supabase.auth.signOut();
    redirect("/login");
}



export async function signInWithGoogle() {
    const supabase = await createClient();

    const origin = (await headers()).get("origin");

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: `${origin}/auth/callback`, // Pass the next path as a query parameter
        },
    });

    if (error) {
        console.error("Google Sign-In Error: ", error.message);
        redirect("/error");
    } else if (data.url) {
        return redirect(data.url); // Supabase handles the OAuth flow
    }
}

