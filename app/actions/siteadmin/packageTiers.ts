"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

// Reusable Package Tier type
export type PackageTier = {
    id: number
    name: string
    slug: string
    tier_type: "first_chapter" | "classic" | "themed"
    theme_id: number | null
    supports_themed: boolean
    supports_regular: boolean
    short_description: string
    is_enabled: boolean
    icon_name: string
    sort: number
    price: number
    allowed_genres: string[]
    package_contents: string[] // ✅ newly added
    created_at: string
    updated_at: string
}

// Get all package tiers
export async function getPackageTiers(): Promise<PackageTier[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("package_tiers")
        .select("*")
        .order("sort", { ascending: true })

    if (error) throw error
    return data as PackageTier[]
}

// Get a single package tier by ID
export async function getPackageTierById(id: number): Promise<PackageTier> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("package_tiers")
        .select("*")
        .eq("id", id)
        .single()

    if (error) throw error
    return data as PackageTier
}

// Create a new package tier
export async function createPackageTier(
    payload: Omit<PackageTier, "id" | "created_at" | "updated_at">
): Promise<PackageTier> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("package_tiers")
        .insert(payload)
        .select("*")
        .single()

    if (error) throw error

    revalidatePath("/siteadmin/package-tiers")

    return data as PackageTier
}

// Update an existing package tier
export async function updatePackageTier(
    id: number,
    updates: Partial<Omit<PackageTier, "id" | "created_at" | "updated_at" | "slug">>
) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("package_tiers")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)

    if (error) throw error
    revalidatePath("/siteadmin/package-tiers")
}

// Delete a package tier
export async function deletePackageTier(id: number) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("package_tiers")
        .delete()
        .eq("id", id)

    if (error) throw error
    revalidatePath("/siteadmin/package-tiers")
}