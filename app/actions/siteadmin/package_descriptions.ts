"use server"
import { createClient } from "@/utils/supabase/server";

// Reusable Package Description type
export type PackageDescription = {
    id: number;
    package_id: number;
    long_description: string;
    reader_notice: string;
    package_contents: string[];
    created_at: string;
    updated_at: string;
};

// Create
export async function createPackageDescription(data: Omit<PackageDescription, "id" | "created_at" | "updated_at">) {
    const supabase = await createClient()

    const { data: created, error } = await supabase
        .from("package_descriptions")
        .insert([data])
        .select()
        .single();

    if (error) throw error;
    return created;
}

// Read All (optionally filter by package_id or search)
export async function getAllPackageDescriptions() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("package_descriptions")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data as PackageDescription[];
}

// Read One by ID
export async function getPackageDescriptionById(id: number) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("package_descriptions")
        .select("*")
        .eq("id", id)
        .single();

    if (error) throw error;
    return data as PackageDescription;
}

// Read by Package ID
export async function getPackageDescriptionByPackageId(package_id: number) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("package_descriptions")
        .select("*")
        .eq("package_id", package_id)
        .single()

    console.log("Package ID:", package_id)
    console.log("Data:", data)
    console.log("Error:", error)

    if (error) throw error;
    // Convert to plain object
    console.log("Prototype before:", Object.getPrototypeOf(data))
    return JSON.parse(JSON.stringify(data)) as PackageDescription;
}


// Update
export async function updatePackageDescriptionByPackageId(
    package_id: number,
    updates: Partial<PackageDescription>
) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("package_descriptions")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("package_id", package_id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// Delete
export async function deletePackageDescription(id: number) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("package_descriptions")
        .delete()
        .eq("id", id);

    if (error) throw error;
    return true;
}