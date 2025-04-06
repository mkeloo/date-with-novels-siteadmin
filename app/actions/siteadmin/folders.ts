"use server"

import { createClient } from "@/utils/supabase/server"

export type FolderType = {
    id: string
    name: string
    slug: string
    parent_type: string
    parent_id: string | null
    created_at: string
}

export async function getAllFolders() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("folders")
        .select("*")
        .order("slug", { ascending: true }) // Optional: ensures parent folders come before children

    if (error) {
        throw new Error(`Failed to fetch folders: ${error.message}`)
    }

    return data
}


export async function createFolder({
    name,
    slug,
    parentType,
}: {
    name: string
    slug: string
    parentType: string
}) {
    const supabase = await createClient()

    // Find parent based on slug hierarchy
    const lastSlashIndex = slug.lastIndexOf("/")
    const parentSlug = lastSlashIndex !== -1 ? slug.slice(0, lastSlashIndex) : null

    let parentId: string | null = null

    if (parentSlug) {
        const { data: parentFolder, error: parentError } = await supabase
            .from("folders")
            .select("id")
            .eq("slug", parentSlug)
            .single()

        if (parentError && parentError.code !== "PGRST116") {
            throw new Error(`Failed to fetch parent folder: ${parentError.message}`)
        }

        parentId = parentFolder?.id ?? null
    }

    const { error: insertError } = await supabase.from("folders").insert({
        name,
        slug,
        parent_type: parentType,
        parent_id: parentId,
    })

    if (insertError) {
        throw new Error(`Failed to create folder: ${insertError.message}`)
    }

    return "Folder created"
}