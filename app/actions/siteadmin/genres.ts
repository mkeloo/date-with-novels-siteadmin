"use server"

import { createClient } from "@/utils/supabase/server"

export interface Genre {
    id: number
    genre_name: string
}

// Get all genres
export async function getGenres() {
    const supabase = await createClient()
    const { data, error } = await supabase.from("genres").select("*").order("id")
    if (error) throw error
    return data
}

// Create a genre
export async function createGenre(genre_name: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("genres")
        .insert({ genre_name })
        .select()
        .single()
    if (error) throw error
    return data
}

// Update a genre
export async function updateGenre(id: number, genre_name: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("genres")
        .update({ genre_name })
        .eq("id", id)
        .select()
        .single()
    if (error) throw error
    return data
}

// Delete a genre
export async function deleteGenre(id: number) {
    const supabase = await createClient()
    const { error } = await supabase.from("genres").delete().eq("id", id)
    if (error) throw error
    return true
}