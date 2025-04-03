"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export type PackageTier = {
    id: number
    name: string
    slug: string
    short_description: string | null
    long_description: string | null
    icon_name: string | null
    supports_themed: boolean
    supports_regular: boolean
    created_at: string
    updated_at: string
}

// 🔹 Get all package tiers
export async function getPackageTiers(): Promise<PackageTier[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("package_tiers")
        .select("*")
        .order("id", { ascending: true })

    if (error) throw error
    return data as PackageTier[]
}

// 🔹 Get package tier by ID
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

// 🔹 Create new package tier
export async function createPackageTier(
    payload: Omit<PackageTier, "id" | "created_at" | "updated_at">[]
): Promise<PackageTier> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("package_tiers")
        .insert(payload) // payload is an array
        .select("*")
        .single()

    if (error) throw error

    return data as PackageTier
}

// 🔹 Update package tier
export async function updatePackageTier(
    id: number,
    updates: Partial<Omit<PackageTier, "id" | "created_at" | "updated_at">>
) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("package_tiers")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)

    if (error) throw error

}

// 🔹 Delete package tier
export async function deletePackageTier(id: number) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("package_tiers")
        .delete()
        .eq("id", id)

    if (error) throw error
}



//  Get support flags (supports_themed & supports_regular) for a package tier
export async function getSupportFlagsByPackageTierId(packageTierId: number): Promise<{
    supports_themed: boolean
    supports_regular: boolean
}> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("package_tiers")
        .select("supports_themed, supports_regular")
        .eq("id", packageTierId)
        .single()

    if (error) throw error

    return {
        supports_themed: data.supports_themed,
        supports_regular: data.supports_regular,
    }
}