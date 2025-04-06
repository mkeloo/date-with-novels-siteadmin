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

    // const bucket = "date-with-novels"
    // console.log("📦 Uploading to bucket:", bucket)

    const cleanedSlug = packageSlug.replace(/^packages\//, "")
    const basePath = `/packages/${cleanedSlug}`

    // Check if the parent folder exists
    let parentFolderId: string | null = null

    const { data: existingParent, error: parentFetchError } = await supabase
        .from("folders")
        .select("id")
        .eq("slug", "packages")
        .single()

    if (parentFetchError && parentFetchError.code === "PGRST116") {
        // If not found, insert it
        const { data: newParent, error: parentInsertError } = await supabase
            .from("folders")
            .insert({
                name: "packages",
                slug: "packages",
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

    // console.log("📁 Parent Folder ID:", parentFolder.id)

    // Folder Upsert Payload
    const folderPayload = {
        name: packageSlug,
        slug: basePath,
        parent_type: "packages",
        parent_id: parentFolderId,
    }

    // console.log("Folder Upsert Payload:", folderPayload)

    const { error: folderError } = await supabase
        .from("folders")
        .upsert(folderPayload, { onConflict: "slug" })

    if (folderError) {
        console.error("Folder upsert error:", folderError)
        throw new Error(`Failed to create folder entry: ${folderError.message}`)
    }

    // Fetch current max sort_order
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

        // console.log(`📄 Uploading file ${i + 1}:`, file.name)
        // console.log(`📏 File size: ${fileSizeMB} MB`)
        // console.log(`📂 File path: ${filePath}`)
        // console.log(file)

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

        // console.log(`📄 Inserting Metadata for file ${i + 1}:`, metadata)

        // Insert metadata for the current file
        const { error: insertError } = await supabase.from("uploads").insert(metadata)

        if (insertError) {
            console.error("Uploads insert error:", insertError)
            throw new Error(`Failed to insert uploads metadata for file ${file.name}: ${insertError.message}`)
        }
    }

    // console.log("Upload successful.")
    return "Upload successful"
}


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

    // Delete file from storage
    const { error: storageError } = await supabase
        .storage
        .from("date-with-novels")
        .remove([filePath])

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