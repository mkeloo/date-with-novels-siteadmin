import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/dashboard";

    if (code) {
        const supabase = await createClient();

        // Exchange the code for a session
        const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
        if (sessionError) {
            console.error("Error exchanging code for session:", sessionError.message);
            return NextResponse.redirect(`${origin}/auth/auth-code-error`);
        }

        // Fetch the authenticated user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) {
            console.error("Error fetching user data:", userError?.message);
            return NextResponse.redirect(`${origin}/error`);
        }

        const user = userData.user;
        console.log("User:", user);

        // Check if the user exists in the user_profiles table
        const { data: existingUser, error: profileError } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("email", user.email)
            .single();

        if (profileError && profileError.code !== "PGRST116") {
            // Handle database errors other than "not found"
            console.error("Error checking user profile:", profileError.message);
            return NextResponse.redirect(`${origin}/error`);
        }

        // Insert a new user profile if it doesn't exist
        if (!existingUser) {
            const { error: insertError } = await supabase.from("user_profiles").insert({
                email: user.email,
                username: user.user_metadata?.name || user.email?.split("@")[0],
            });

            if (insertError) {
                console.error("Error inserting user profile:", insertError.message);
                return NextResponse.redirect(`${origin}/error`);
            }
        }

        // Fetch again (either existing or newly inserted)
        const { data: profile } = await supabase
            .from("user_profiles")
            .select("user_type_id")
            .eq("email", user.email)
            .single();

        // Only allow admins
        if (profile?.user_type_id !== 1) {
            console.warn("Unauthorized access attempt:", user.email);
            return NextResponse.redirect(`${origin}/unauthorized`);
        }

        // Redirect to the "next" path or default to /account
        return NextResponse.redirect(`${origin}${next}`);
    }

    // Handle missing or invalid code in the query string
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}