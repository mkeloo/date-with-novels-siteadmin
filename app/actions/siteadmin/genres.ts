"use server"

import { createClient } from "@/utils/supabase/server"

export interface Genre {
    id: number
    genre_name: string
    emoji_list: string[] | null
    background_color: string | null
}

// Get all genres
export async function getGenres(): Promise<Genre[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("genres")
        .select("*")
        .order("id")
    if (error) throw error
    return data as Genre[]
}

// Create a genre with optional emoji_list and background_color
export async function createGenre(
    genre_name: string,
    emoji_list?: string[],
    background_color?: string
): Promise<Genre> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("genres")
        .insert({ genre_name, emoji_list, background_color })
        .select()
        .single()
    if (error) throw error
    return data as Genre
}

// Update a genre by ID with optional emoji_list and background_color
export async function updateGenre(
    id: number,
    genre_name: string,
    emoji_list?: string[],
    background_color?: string
): Promise<Genre> {
    const supabase = await createClient()
    const updates: Partial<Genre> = {
        genre_name,
        ...(emoji_list ? { emoji_list } : {}),
        ...(background_color ? { background_color } : {}),
    }
    const { data, error } = await supabase
        .from("genres")
        .update(updates)
        .eq("id", id)
        .select()
        .single()
    if (error) throw error
    return data as Genre
}

// Delete a genre by ID
export async function deleteGenre(id: number): Promise<boolean> {
    const supabase = await createClient()
    const { error } = await supabase.from("genres").delete().eq("id", id)
    if (error) throw error
    return true
}