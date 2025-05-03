"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

import Stripe from "stripe"


// initialize Stripe client with correct API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-03-31.basil",
})

// Reusable Package Tier type
export type Packages = {
    id: number
    name: string
    slug: string
    theme_id: number | null
    short_description: string
    is_enabled: boolean
    icon_name: string
    sort: number
    price: number
    allowed_genres: string[]
    package_tier: number
    supports_themed?: boolean
    supports_regular?: boolean
    created_at: string
    updated_at: string
    stripe_product_id?: string | null
    stripe_price_id?: string | null
    is_stripe_synced?: boolean
    stripe_sync_error?: string | null
}


// Get all packages
export async function getPackages(): Promise<Packages[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("packages")
        .select("*")
        .order("sort", { ascending: true })

    if (error) throw error
    return data as Packages[]
}

// Get a single package by ID
export async function getPackagesById(id: number): Promise<Packages> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("packages")
        .select("*")
        .eq("id", id)
        .single()

    if (error) throw error
    return data as Packages
}

// Get a single package by slug
export async function getPackagesBySlug(slug: string): Promise<Packages | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("packages")
        .select("*")
        .eq("slug", slug)
        .single()

    if (error) {
        console.error("Error fetching package tier by slug:", error)
        return null
    }


    return data as Packages
}

// Create a new package
export async function createPackages(
    payload: Omit<Packages, "id" | "created_at" | "updated_at">
): Promise<Packages> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("packages")
        .insert(payload)
        .select("*")
        .single()

    if (error) throw error

    revalidatePath("/siteadmin/packages")

    return data as Packages
}

// Update an existing package
export async function updatePackages(
    id: number,
    updates: Partial<Omit<Packages, "id" | "created_at" | "updated_at" | "slug">>
) {
    const supabase = await createClient()

    const { error } = await supabase
        .from("packages")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)

    if (error) throw error
    revalidatePath("/siteadmin/packages")
}


// Delete a package and its associated Stripe product
// This function is responsible for deleting a package and its associated Stripe product.
// It first retrieves the Stripe product ID from the database, then archives all prices associated with that product.
// Finally, it archives the product itself and removes the package from the database.
// export async function deletePackages(id: number) {
//     const supabase = await createClient();

//     // ── 1. get stripe_product_id ────────────────────────────────
//     const { data: syncRecord } = await supabase
//         .from("package_stripe_sync")
//         .select("stripe_product_id")
//         .eq("package_id", id)
//         .single();

//     const stripeProductId = syncRecord?.stripe_product_id;

//     if (stripeProductId) {
//         try {
//             // ── 2. archive every price ──────────────────────────────
//             const prices = await stripe.prices.list({
//                 product: stripeProductId,
//                 limit: 100,
//             });

//             for (const price of prices.data) {
//                 if (price.active) {
//                     await stripe.prices.update(price.id, { active: false });
//                     console.log(`Archived price ${price.id}`);
//                 }
//             }

//             // ── 3. archive the product itself ───────────────────────
//             await stripe.products.update(stripeProductId, { active: false });
//             console.log(`Archived Stripe product ${stripeProductId}`);
//         } catch (err) {
//             console.error(`Stripe clean‑up failed for ${stripeProductId}:`, err);
//         }
//     } else {
//         console.warn("Package had no Stripe sync row – skipping Stripe clean‑up.");
//     }

//     // ── 4. remove sync + package locally ───────────────────────
//     await supabase.from("package_stripe_sync").delete().eq("package_id", id);
//     await supabase.from("packages").delete().eq("id", id);

//     revalidatePath("/siteadmin/packages");
// }


export async function deletePackages(id: number) {
    /* get a real Supabase client */
    const supabase = await createClient();      // ←  await is essential

    /* ── 1. fetch stripe_product_id ─────────────────────────── */
    const { data: syncRecord } = await supabase
        .from("package_stripe_sync")
        .select("stripe_product_id")
        .eq("package_id", id)
        .single();

    const stripeProductId = syncRecord?.stripe_product_id;

    /* ── 2. archive Stripe prices + product ─────────────────── */
    if (stripeProductId) {
        try {
            const prices = await stripe.prices.list({ product: stripeProductId, limit: 100 });
            for (const price of prices.data) {
                if (price.active) {
                    await stripe.prices.update(price.id, { active: false });
                    console.log(`Archived price ${price.id}`);
                }
            }
            await stripe.products.update(stripeProductId, { active: false });
            console.log(`Archived Stripe product ${stripeProductId}`);
        } catch (err) {
            console.error(`Stripe clean‑up failed for ${stripeProductId}:`, err);
        }
    } else {
        console.warn("Package had no Stripe sync row – skipping Stripe clean‑up.");
    }

    /* ── 3. get the package slug once so we can delete its folder row ── */
    const { data: pkgRow } = await supabase
        .from("packages")
        .select("slug")
        .eq("id", id)
        .single();
    const slug = pkgRow?.slug ?? "";

    /* ── 4. remove *everything* tied to this package in parallel ───── */
    await Promise.all([
        supabase.from("uploads")              // uploads table
            .delete()
            .eq("ref_type", "package")
            .eq("ref_id", id),

        supabase.from("package_description")  // description table
            .delete()
            .eq("package_id", id),

        supabase.from("folders")              // folder row (by slug)
            .delete()
            .eq("parent_type", "packages")
            .eq("name", slug),

        supabase.from("package_stripe_sync")  // sync row
            .delete()
            .eq("package_id", id),

        supabase.from("packages")             // the package itself
            .delete()
            .eq("id", id),
    ]);

    /* ── 5. re‑validate UI route ─────────────────────────────── */
    revalidatePath("/siteadmin/packages");
}




/* ──────────────────────────────────────────────────────────
   BULK CLEAN‑UP OF *ORPHANED* ROWS
   ────────────────────────────────────────────────────────── */
/* ------------------------------------------------------------------
   deleteOrphanedPackageData
   ‑ any “child” rows in uploads ▸ folders ▸ package_description
   ‑ that reference a package which no longer exists
   -----------------------------------------------------------------*/
export async function deleteOrphanedPackageData() {
    const supabase = await createClient();

    /* 1. collect all live package ids & slugs */
    const { data: pkgs, error: pkgErr } = await supabase
        .from("packages")
        .select("id, slug");

    if (pkgErr) throw pkgErr;

    const validIds = pkgs!.map(p => p.id);          // e.g. [2, 6, 10]
    const validSlugs = pkgs!.map(p => p.slug);        // ["classic‑edition", …]

    /* 2. uploads ---------------------------------------------------- */
    await supabase
        .from("uploads")
        .delete()
        .eq("ref_type", "package")
        .not("ref_id", "in", `(${validIds.join(",")})`);

    /* 3. package_description --------------------------------------- */
    await supabase
        .from("package_description")
        .delete()
        .not("package_id", "in", `(${validIds.join(",")})`);

    /* 4. folders ---------------------------------------------------- */
    const keepNames = ["packages", ...validSlugs];   // root + every live slug

    await supabase
        .from("folders")
        .delete()
        .eq("parent_type", "packages")                 // only package folders
        .not("parent_id", "is", null)                  // never touch the root row
        .not("name", "in", `(${keepNames.join(",")})`);// <-- no quotes here

    /* 5. done ------------------------------------------------------- */
    revalidatePath("/siteadmin/packages");
}