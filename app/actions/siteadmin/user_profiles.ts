"use server";
import { createClient } from "@/utils/supabase/server";

// --------------------
// Types
// --------------------
export type UserProfile = {
    id: string;
    email: string;
    username: string;
    user_type_id: number; // 1: admin, 2: user
    created_at: string;
};

// --------------------
// API Functions
// --------------------

// Get all user profiles
export async function getAllUserProfiles(): Promise<UserProfile[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error("Failed to fetch user profiles: " + error.message);
    }

    return data as UserProfile[];
}


// Get user profile from session
export async function getUserProfileFromSession(): Promise<UserProfile | null> {
    // Use the same pattern as in getAllUserProfiles.
    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        throw new Error("No authenticated user found.");
    }

    const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (profileError) {
        throw new Error("Failed to fetch user profile: " + profileError.message);
    }

    return profile as UserProfile;
}



/****************************************
 * Get current Supabase Auth User
 ****************************************/

export async function getCurrentUser() {
    // Create the Supabase client (configured for server use).
    const supabase = await createClient();

    // Use getSession() to get the current session
    const {
        data: { session },
        error,
    } = await supabase.auth.getSession();

    // If there's an error or no session/user, return null.
    if (error || !session?.user) {
        return null;
    }

    // Return the authenticated user.
    return session.user;
}