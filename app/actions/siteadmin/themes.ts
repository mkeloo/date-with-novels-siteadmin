"use server"

import { createClient } from "@/utils/supabase/server"

export interface Theme {
    id: number
    theme_name: string
}

// Get all themes
export async function getThemes() {
    const supabase = await createClient()
    const { data, error } = await supabase.from("themes").select("*").order("id")
    if (error) throw error
    return data
}

// Create a theme
export async function createTheme(theme_name: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("themes")
        .insert({ theme_name })
        .select()
        .single()
    if (error) throw error
    return data
}

// Update a theme by ID
export async function updateTheme(id: number, theme_name: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("themes")
        .update({ theme_name })
        .eq("id", id)
        .select()
        .single()
    if (error) throw error
    return data
}

// Delete a theme by ID
export async function deleteTheme(id: number) {
    const supabase = await createClient()
    const { error } = await supabase.from("themes").delete().eq("id", id)
    if (error) throw error
    return true
}