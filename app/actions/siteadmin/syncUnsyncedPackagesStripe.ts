"use server"

import { createClient } from "@/utils/supabase/server"
import Stripe from "stripe"
import { getPackagesById } from "./packages"
import { getPackageMediaFiles } from "./image_uploader"

// initialize Stripe client with correct API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-03-31.basil",
})

//
//  Types
//
//  Types

// /v1/products
// Stripe Product Response Type
export type StripeProductResponse = {
    id: string
    object: "product"
    active: boolean
    attributes: string[]
    created: number
    default_price: string | null
    description: string | null
    images: string[]
    livemode: boolean
    marketing_features: any[]
    metadata: {
        slug: string
        theme_id?: string
        package_tier?: string
        supports_regular?: string
        supports_themed?: string
    }
    name: string
    package_dimensions: any | null
    shippable: boolean | null
    statement_descriptor: string | null
    tax_code: string | null
    type: "service" | "good"
    unit_label: string | null
    updated: number
    url: string | null
}

// Request Body Type
export type StripeProductCreatePayload = {
    name: string
    description?: string
    url?: string
    shippable?: boolean
    images?: string[]
    metadata?: {
        slug: string
        theme_id?: string
        package_tier?: string
        supports_regular?: string
        supports_themed?: string
    }
}

// /v1/prices
// Stripe Price Response Type
type StripePriceResponse = {
    id: string
    object: "price"
    active: boolean
    billing_scheme: "per_unit" | "tiered"
    created: number
    currency: string
    custom_unit_amount: null
    livemode: boolean
    lookup_key: string | null
    metadata: Record<string, string>
    nickname: string | null
    product: string
    recurring: null | {
        aggregate_usage?: string
        interval: "day" | "week" | "month" | "year"
        interval_count: number
        trial_period_days?: number
        usage_type: "licensed" | "metered"
    }
    tax_behavior: "inclusive" | "exclusive" | "unspecified"
    tiers_mode: null | "graduated" | "volume"
    transform_quantity: null | object
    type: "one_time" | "recurring"
    unit_amount: number
    unit_amount_decimal: string
}

// Stripe Price Create Payload
type StripePriceCreatePayload = {
    product: string
    currency: string
    unit_amount: number
    metadata?: Record<string, string>
}


// Additional Type for Supabase sync record
export type PackageStripeSync = {
    id: number
    package_id: number
    stripe_product_id: string
    stripe_price_id: string
    sync_status: "pending" | "synced" | "failed"
    last_synced_at: string
    sync_error: string | null
}

//
//  Actions
//  - getAllStripeProducts()         — Pull current Stripe catalog
//  - getStripeProductById()         — Fetch & compare one Stripe product
//  - syncPackageToStripe()          — Create or update Stripe product + price
//  - resyncPackageToStripe()        — Update existing Stripe product + price
//  - bulkSyncUnsyncedPackages()     — Loop through unsynced packages
//

/**
 * getAllStripeProducts()
 *  - Pull current Stripe catalog (products + first price)
 */
export async function getAllStripeProducts(): Promise<
    (Stripe.Product & { price?: Stripe.Price | null })[]
> {
    try {
        const productsList = await stripe.products.list({ limit: 100 })
        const pricesList = await stripe.prices.list({ limit: 100 })

        return productsList.data.map((product) => {
            const matched = pricesList.data.find((p) => p.product === product.id) || null
            return {
                ...product,
                price: matched,
            }
        })
    } catch (err: any) {
        console.error("Failed to fetch Stripe products:", err.message)
        throw err
    }
}

/**
 * getStripeProductById
 *  - fetch full Stripe product + its first price
 */
export async function getStripeProductById(
    productId: string
): Promise<(Stripe.Product & { price?: Stripe.Price | null }) | null> {
    try {
        const product = await stripe.products.retrieve(productId)
        const prices = await stripe.prices.list({ product: productId, limit: 1 })
        return {
            ...product,
            price: prices.data[0] || null,
        }
    } catch (err: any) {
        console.error(`Failed to retrieve Stripe product [${productId}]:`, err)
        return null
    }
}

/**
 * syncPackageToStripe
 *  - if no sync record exists, create product+price
 *  - if sync exists, update product then issue a new price
 *  - upsert into package_stripe_sync ON package_id
 */
/**
 * syncPackageToStripe
 *  - if no sync record exists, create product+price
 *  - if sync exists, update product then issue a new price if the amount changed
 *  - upsert into package_stripe_sync ON package_id
 */
export async function syncPackageToStripe(packageId: number): Promise<void> {
    const supabase = createClient();

    const pkg = await getPackagesById(packageId);
    const media = await getPackageMediaFiles(pkg.id);
    const images = media.slice(0, 3).map((m) => m.src);

    const { data: existingSync } = await (await supabase)
        .from("package_stripe_sync")
        .select("stripe_product_id, stripe_price_id")
        .eq("package_id", packageId)
        .single();

    let productId = existingSync?.stripe_product_id;
    let currentStripePriceId = existingSync?.stripe_price_id;

    try {
        if (productId) {
            await stripe.products.update(productId, {
                name: pkg.name,
                description: pkg.short_description || undefined,
                images,
                url: `https://datewithnovels.com/packages/${pkg.slug}`,
                metadata: {
                    slug: pkg.slug,
                    theme_id: pkg.theme_id?.toString() ?? "null",
                    package_tier: pkg.package_tier?.toString() ?? "null",
                    supports_themed: pkg.supports_themed ? "true" : "false",
                    supports_regular: pkg.supports_regular ? "true" : "false",
                },
            });
        } else {
            const created = await stripe.products.create({
                name: pkg.name,
                description: pkg.short_description || undefined,
                images,
                url: `https://datewithnovels.com/packages/${pkg.slug}`,
                shippable: true,
                metadata: {
                    slug: pkg.slug,
                    theme_id: pkg.theme_id?.toString() ?? "null",
                    package_tier: pkg.package_tier?.toString() ?? "null",
                    supports_themed: pkg.supports_themed ? "true" : "false",
                    supports_regular: pkg.supports_regular ? "true" : "false",
                },
            });
            productId = created.id;
        }

        let shouldCreateNewPrice = true;

        if (currentStripePriceId) {
            const currentStripePrice = await stripe.prices.retrieve(currentStripePriceId);

            if (currentStripePrice.unit_amount === Math.round(pkg.price * 100)) {
                shouldCreateNewPrice = false; // Price matches; no new price needed
            } else {
                // Deactivate old price if amount changed
                await stripe.prices.update(currentStripePriceId, { active: false });
            }
        }

        let newPriceId = currentStripePriceId;

        // Only create new price if local price changed
        if (shouldCreateNewPrice) {
            const newPrice = await stripe.prices.create({
                product: productId!,
                currency: "usd",
                unit_amount: Math.round(pkg.price * 100),
            });
            newPriceId = newPrice.id;
        }

        // Upsert sync record
        const { error } = await (await supabase)
            .from("package_stripe_sync")
            .upsert(
                {
                    package_id: packageId,
                    stripe_product_id: productId!,
                    stripe_price_id: newPriceId!,
                    sync_status: "synced",
                    last_synced_at: new Date().toISOString(),
                    sync_error: null,
                },
                { onConflict: "package_id" }
            );

        if (error) {
            console.error("Upsert into package_stripe_sync failed:", error);
        } else {
            console.log("Upserted sync row successfully");
        }
    } catch (err: any) {
        console.error("Stripe sync failed:", err);

        // fallback: mark as FAILED
        await (await supabase)
            .from("package_stripe_sync")
            .upsert(
                {
                    package_id: packageId,
                    stripe_product_id: productId ?? "",
                    stripe_price_id: "",
                    sync_status: "failed",
                    last_synced_at: new Date().toISOString(),
                    sync_error: err.message,
                },
                { onConflict: "package_id" }
            );
    }
}


/**
 * getStripeSyncRecord
 *  - helper to fetch sync row for UI
 */
export async function getStripeSyncRecord(packageId: number) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("package_stripe_sync")
        .select("*")
        .eq("package_id", packageId)
        .single()

    if (error) {
        console.error("[getStripeSyncRecord] error:", error)
        return null
    }
    return data as PackageStripeSync
}

/**
 * resyncPackageToStripe
 *  - Update existing product + create new price
 */
export async function resyncPackageToStripe(packageId: number): Promise<void> {
    const supabase = await createClient()
    const pkg = await getPackagesById(packageId)
    const media = await getPackageMediaFiles(pkg.id)
    const images = media.slice(0, 3).map((m) => m.src)

    // Fetch current sync record
    const { data: syncRecord } = await supabase
        .from("package_stripe_sync")
        .select("stripe_product_id")
        .eq("package_id", packageId)
        .single()

    const productId = syncRecord?.stripe_product_id
    if (!productId) throw new Error("Package is not linked to a Stripe product.")

    try {
        await stripe.products.update(productId, {
            name: pkg.name,
            description: pkg.short_description || undefined,
            images,
            url: `https://datewithnovels.com/packages/${pkg.slug}`,
            metadata: {
                slug: pkg.slug,
                theme_id: pkg.theme_id?.toString() ?? "null",
                supports_themed: pkg.supports_themed ? "true" : "false",
                supports_regular: pkg.supports_regular ? "true" : "false",
                package_tier: pkg.package_tier?.toString() ?? "null",
            },
        })

        const stripePrice = await stripe.prices.create({
            product: productId,
            currency: "usd",
            unit_amount: Math.round(pkg.price * 100),
        })

        await supabase
            .from("package_stripe_sync")
            .update({
                stripe_price_id: stripePrice.id,
                sync_status: "synced",
                sync_error: null,
                last_synced_at: new Date().toISOString(),
            })
            .eq("package_id", packageId)
    } catch (err: any) {
        console.error("Stripe resync failed:", err)
        await supabase
            .from("package_stripe_sync")
            .update({
                sync_status: "failed",
                sync_error: err.message,
                last_synced_at: new Date().toISOString(),
            })
            .eq("package_id", packageId)
    }
}

/**
 * bulkSyncUnsyncedPackages()
 *  - Loop through .is_stripe_synced === null
 */
export async function bulkSyncUnsyncedPackages(): Promise<{ status: string }> {
    const supabase = await createClient()
    const { data: packages, error } = await supabase
        .from("packages")
        .select("id")
        .is("stripe_product_id", null)

    if (error) throw error

    for (const pkg of packages!) {
        await syncPackageToStripe(pkg.id)
    }

    return { status: "done" }
}