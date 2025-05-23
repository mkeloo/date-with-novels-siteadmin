"use server"

import { createClient } from "@/utils/supabase/server"

export interface Theme {
    id: number
    theme_name: string
    emoji_list: string[] | null
    background_color: string | null
    supports_themed: boolean
    supports_regular: boolean
}

// Get all themes
export async function getThemes(): Promise<Theme[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("themes")
        .select("*")
        .order("id")
    if (error) throw error
    return data as Theme[]
}

// Get a theme by ID
export async function getThemeById(id: number): Promise<Theme | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("themes")
        .select("*")
        .eq("id", id)
        .single()
    if (error) throw error
    return data as Theme
}

// Create a theme
export async function createTheme(
    theme_name: string,
    emoji_list?: string[],
    background_color?: string
): Promise<Theme> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("themes")
        .insert({ theme_name, emoji_list, background_color })
        .select()
        .single()
    if (error) throw error
    return data as Theme
}

// Update a theme by ID
export async function updateTheme(
    id: number,
    theme_name: string,
    emoji_list?: string[],
    background_color?: string
): Promise<Theme> {
    const supabase = await createClient()
    const updates: Partial<Theme> = {
        theme_name,
        ...(emoji_list ? { emoji_list } : {}),
        ...(background_color ? { background_color } : {}),
    }

    const { data, error } = await supabase
        .from("themes")
        .update(updates)
        .eq("id", id)
        .select()
        .single()
    if (error) throw error
    return data as Theme
}

// Delete a theme by ID
export async function deleteTheme(id: number): Promise<boolean> {
    const supabase = await createClient()
    const { error } = await supabase.from("themes").delete().eq("id", id)
    if (error) throw error
    return true
}



//  Get support flags (supports_themed & supports_regular) for a package tier
export async function getSupportFlagsByThemes(themeId: number): Promise<{
    supports_themed: boolean
    supports_regular: boolean
}> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("themes")
        .select("supports_themed, supports_regular")
        .eq("id", themeId)
        .single()

    if (error) throw error

    return {
        supports_themed: data.supports_themed,
        supports_regular: data.supports_regular,
    }
}