"use server"

import { createClient } from "@/utils/supabase/server"


// Get all uploads by ref_type + ref_id (e.g., a package or theme)
export async function getUploadsByRef({
    refType,
    refId,
}: {
    refType: string
    refId: string
}) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("uploads")
        .select("*")
        .eq("ref_type", refType)
        .eq("ref_id", refId)
        .order("sort_order", { ascending: true })

    if (error) throw error
    return data
}

// Update upload (e.g., alt text or sort order)
export async function updateUpload(
    id: string,
    updates: Partial<{
        file_path: string
        file_size_mb: number
        alt_text: string
        sort_order: number
    }>
) {

    const supabase = await createClient()

    const { data, error } = await supabase
        .from("uploads")
        .update(updates)
        .eq("id", id)
        .select()
        .single()

    if (error) throw error
    return data
}