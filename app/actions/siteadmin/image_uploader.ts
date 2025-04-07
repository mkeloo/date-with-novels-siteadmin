"use server"

import { createClient } from "@/utils/supabase/server"


export async function uploadPackageMediaFiles(formData: FormData) {
    const supabase = await createClient()

    const refType = formData.get("ref_type") as string
    const refId = formData.get("ref_id") as string
    const packageSlug = formData.get("package_slug") as string

    if (!refType || !refId || !packageSlug) {
        throw new Error("Missing required metadata (ref_type, ref_id, package_slug)")
    }

    const files = formData.getAll("files") as File[]
    const altTexts = files.map((_, idx) => formData.get(`alt-${idx}`) as string)

    // Remove any leading "packages/" from packageSlug so we work only with the sub-path
    const cleanedSlug = packageSlug.replace(/^packages\//, "")
    // Create an array of folder segments
    const folderSegments = cleanedSlug.split('/')

    // Ensure the root folder "packages" exists
    let parentFolderId: string | null = null
    const rootSlug = "packages"
    const { data: existingParent, error: parentFetchError } = await supabase
        .from("folders")
        .select("id")
        .eq("slug", rootSlug)
        .single()

    if (parentFetchError && parentFetchError.code === "PGRST116") {
        const { data: newParent, error: parentInsertError } = await supabase
            .from("folders")
            .insert({
                name: "packages",
                slug: rootSlug,
                parent_type: "packages",
            })
            .select("id")
            .single()

        if (parentInsertError || !newParent) {
            console.error("Failed to create 'packages' root folder:", parentInsertError)
            throw new Error("Failed to create root 'packages' folder.")
        }
        parentFolderId = newParent.id
    } else if (existingParent) {
        parentFolderId = existingParent.id
    } else {
        console.error("Failed to fetch 'packages' folder:", parentFetchError)
        throw new Error("Unexpected error fetching 'packages' folder.")
    }

    // Iterate over each folder segment to build the nested structure
    let currentSlug = rootSlug
    for (const segment of folderSegments) {
        currentSlug += `/${segment}`

        // Check if the folder for the current segment exists
        const { data: existingFolder, error: folderFetchError } = await supabase
            .from("folders")
            .select("id")
            .eq("slug", currentSlug)
            .single()

        if (folderFetchError && folderFetchError.code === "PGRST116") {
            // Not found, so insert this folder
            const { data: newFolder, error: folderInsertError } = await supabase
                .from("folders")
                .insert({
                    name: segment,
                    slug: currentSlug,
                    parent_type: "packages",
                    parent_id: parentFolderId,
                })
                .select("id")
                .single()

            if (folderInsertError || !newFolder) {
                console.error(`Failed to create folder '${segment}':`, folderInsertError)
                throw new Error(`Failed to create folder '${segment}'.`)
            }
            // Update the parentFolderId for the next level
            parentFolderId = newFolder.id
        } else if (existingFolder) {
            // Folder exists – update parentFolderId to its id for next level
            parentFolderId = existingFolder.id
        } else {
            console.error(`Unexpected error fetching folder '${segment}':`, folderFetchError)
            throw new Error(`Error fetching folder '${segment}'.`)
        }
    }

    // Use the final currentSlug as the base path for file uploads.
    // currentSlug is now something like "packages/classic-edition"
    const basePath = currentSlug

    // Fetch current max sort_order from the uploads table
    const { data: maxSortRow, error: sortError } = await supabase
        .from("uploads")
        .select("sort_order")
        .eq("ref_type", refType)
        .eq("ref_id", refId)
        .order("sort_order", { ascending: false })
        .limit(1)
        .single()

    const currentMaxSort = maxSortRow?.sort_order || 0

    // Process each file one by one
    for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const alt = altTexts[i] || file.name
        const fileName = `${Date.now()}-${file.name}`
        const filePath = `${basePath}/${fileName}`
        const fileSizeMB = (file.size / (1000 * 1000)).toFixed(2)

        // Upload file to storage
        const { error: uploadError } = await supabase.storage
            .from("date-with-novels")
            .upload(filePath, file)

        if (uploadError) {
            console.error(`Upload failed for ${file.name}:`, uploadError)
            throw new Error(`Upload failed for ${file.name}: ${uploadError.message}`)
        }

        // Prepare metadata for the file
        const metadata = {
            file_path: filePath,
            file_size_mb: Number(fileSizeMB),
            alt_text: alt,
            ref_type: refType,
            ref_id: refId,
            sort_order: currentMaxSort + i + 1,
        }

        // Insert metadata for the current file
        const { error: insertError } = await supabase.from("uploads").insert(metadata)

        if (insertError) {
            console.error("Uploads insert error:", insertError)
            throw new Error(`Failed to insert uploads metadata for file ${file.name}: ${insertError.message}`)
        }
    }

    return "Upload successful"
}



// Fetch package media files
export async function getPackageMediaFiles(packageId: number) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("uploads")
        .select("id, alt_text, file_path")
        .eq("ref_type", "package")
        .eq("ref_id", packageId)
        .order("sort_order", { ascending: true })

    if (error) {
        throw new Error(`Failed to fetch uploads: ${error.message}`)
    }

    const images = data.map((item) => ({
        id: item.id,
        alt: item.alt_text,
        src: supabase.storage.from("date-with-novels").getPublicUrl(item.file_path).data.publicUrl,
    }))

    return images
}


// Delete package media file
export async function deletePackageMediaFile(uploadId: string) {
    const supabase = await createClient()

    // Get the file path from the uploads table
    const { data, error: fetchError } = await supabase
        .from("uploads")
        .select("file_path")
        .eq("id", uploadId)
        .single()

    if (fetchError || !data) {
        console.error("Failed to fetch file path for deletion:", fetchError)
        throw new Error("File not found or could not retrieve path.")
    }

    const filePath = data.file_path
    // Remove leading slash if present
    const normalizedFilePath = filePath.replace(/^\//, "")

    // Delete file from storage
    const { error: storageError } = await supabase
        .storage
        .from("date-with-novels")
        .remove([normalizedFilePath])

    if (storageError) {
        console.error("Failed to delete from storage:", storageError)
        throw new Error(`Failed to delete file from storage: ${storageError.message}`)
    }

    // Delete metadata from uploads table
    const { error: deleteError } = await supabase
        .from("uploads")
        .delete()
        .eq("id", uploadId)

    if (deleteError) {
        console.error("Failed to delete from uploads table:", deleteError)
        throw new Error(`Failed to delete file metadata: ${deleteError.message}`)
    }

    return "File deleted successfully"
}