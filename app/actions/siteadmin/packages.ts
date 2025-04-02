"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

// Reusable Package Tier type
export type Packages = {
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
export async function getPackages(): Promise<Packages[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("packages")
        .select("*")
        .order("sort", { ascending: true })

    if (error) throw error
    return data as Packages[]
}

// Get a single package tier by ID
export async function getPackagesById(id: number): Promise<Packages> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("packages")
        .select("*")
        .eq("id", id)
        .single()

    if (error) throw error
    return data as Packages
}

// Get a single package tier by slug
export async function getPackagesBySlug(slug: string): Promise<Packages | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("packages")
        .select("*")
        .eq("slug", slug)
        .single()

    if (error) {
        console.error("Error fetching package tier by slug:", error)
        return null
    }


    return data as Packages
}

// Create a new package tier
export async function createPackages(
    payload: Omit<Packages, "id" | "created_at" | "updated_at">
): Promise<Packages> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("packages")
        .insert(payload)
        .select("*")
        .single()

    if (error) throw error

    revalidatePath("/siteadmin/packages")

    return data as Packages
}

// Update an existing package tier
export async function updatePackages(
    id: number,
    updates: Partial<Omit<Packages, "id" | "created_at" | "updated_at" | "slug">>
) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("packages")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)

    if (error) throw error
    revalidatePath("/siteadmin/packages")
}

// Delete a package tier
export async function deletePackages(id: number) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("packages")
        .delete()
        .eq("id", id)

    if (error) throw error
    revalidatePath("/siteadmin/packages")
}
