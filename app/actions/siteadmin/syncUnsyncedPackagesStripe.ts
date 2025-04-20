"use server"

import { createClient } from "@/utils/supabase/server"
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY!)

import { getPackagesById } from "./packages"
import { getPackageMediaFiles } from "./image_uploader"

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

// Action                                          -              Purpose
// getAllStripeProducts()                          -     Pull current Stripe catalog
// getStripeProductById(productId)                 -     Fetch & compare one Stripe product
// syncPackageToStripe(packageId)                  -     Already done
// resyncPackageToStripe(packageId)                -     Update existing Stripe product
// bulkSyncUnsyncedPackages()                      -     Loop through .is_stripe_synced === false


// getAllStripeProducts() - Pull current Stripe catalog
export async function getAllStripeProducts(): Promise<
    (StripeProductResponse & { price?: StripePriceResponse | null })[]
> {
    try {
        const products = await stripe.products.list({ limit: 100 })
        const prices = await stripe.prices.list({ limit: 100 })

        return products.data.map((product: StripeProductResponse) => {
            const price = prices.data.find((p: StripePriceResponse) => p.product === product.id)
            return {
                ...product,
                price: price || null,
            }
        })
    } catch (err: any) {
        console.error("Failed to fetch Stripe products:", err.message)
        throw err
    }
}

// getStripeProductById(productId) - Fetch & compare one Stripe product
export async function getStripeProductById(
    productId: string
): Promise<(StripeProductResponse & { price?: StripePriceResponse | null }) | null> {
    try {
        const product: StripeProductResponse = await stripe.products.retrieve(productId)
        const priceList = await stripe.prices.list({ product: productId, limit: 1 })
        const price = priceList.data[0] || null

        return {
            ...product,
            price,
        }
    } catch (err: any) {
        console.error(`Failed to retrieve Stripe product [${productId}]:`, err.message)
        return null
    }
}


// getStripeSyncRecord(packageId) - Fetch sync record for a package
export async function getStripeSyncRecord(packageId: number) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("package_stripe_sync")
        .select("*")
        .eq("package_id", packageId)
        .single()

    if (error) return null
    return data as PackageStripeSync
}

// syncPackageToStripe(packageId) - Create new product + price for unsynced package
export async function syncPackageToStripe(packageId: number): Promise<void> {
    const supabase = await createClient()
    const pkg = await getPackagesById(packageId)
    const media = await getPackageMediaFiles(pkg.id)
    const imageUrls = media.slice(0, 3).map((img) => img.src)

    try {
        const stripeProduct = await stripe.products.create({
            name: pkg.name,
            description: pkg.short_description || undefined,
            images: imageUrls,
            url: `https://datewithnovels.com/packages/${pkg.slug}`,
            shippable: true,
            metadata: {
                slug: pkg.slug,
                theme_id: pkg.theme_id?.toString() ?? "null",
                supports_themed: pkg.supports_themed ? "true" : "false",
                supports_regular: pkg.supports_regular ? "true" : "false",
                package_tier: pkg.package_tier?.toString() ?? "null",
            },
        })

        const stripePrice = await stripe.prices.create({
            unit_amount: Math.round(pkg.price * 100),
            currency: "usd",
            product: stripeProduct.id,
        })

        await supabase.from("package_stripe_sync").insert({
            package_id: pkg.id,
            stripe_product_id: stripeProduct.id,
            stripe_price_id: stripePrice.id,
            sync_status: "synced",
            last_synced_at: new Date().toISOString(),
            sync_error: null,
        })
    } catch (err: any) {
        console.error("Stripe sync failed:", err)

        await supabase.from("package_stripe_sync").insert({
            package_id: pkg.id,
            stripe_product_id: "",
            stripe_price_id: "",
            sync_status: "failed",
            last_synced_at: new Date().toISOString(),
            sync_error: err.message,
        })
    }
}

// resyncPackageToStripe(packageId) - Update existing product + create new price
export async function resyncPackageToStripe(packageId: number): Promise<void> {
    const supabase = await createClient()
    const pkg = await getPackagesById(packageId)
    const media = await getPackageMediaFiles(pkg.id)
    const imageUrls = media.slice(0, 3).map((img) => img.src)

    // Fetch current sync record
    const { data: syncRecord } = await supabase
        .from("package_stripe_sync")
        .select("stripe_product_id")
        .eq("package_id", pkg.id)
        .single()

    const productId = syncRecord?.stripe_product_id
    if (!productId) throw new Error("Package is not linked to a Stripe product.")

    try {
        await stripe.products.update(productId, {
            name: pkg.name,
            description: pkg.short_description || undefined,
            images: imageUrls,
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
            unit_amount: Math.round(pkg.price * 100),
            currency: "usd",
            product: productId,
        })

        await supabase
            .from("package_stripe_sync")
            .update({
                stripe_price_id: stripePrice.id,
                sync_status: "synced",
                sync_error: null,
                last_synced_at: new Date().toISOString(),
            })
            .eq("package_id", pkg.id)
    } catch (err: any) {
        console.error("Stripe resync failed:", err)

        await supabase
            .from("package_stripe_sync")
            .update({
                sync_status: "failed",
                sync_error: err.message,
                last_synced_at: new Date().toISOString(),
            })
            .eq("package_id", pkg.id)
    }
}

// bulkSyncUnsyncedPackages() - Loop through .is_stripe_synced === false
export async function bulkSyncUnsyncedPackages(): Promise<{ status: string }> {
    const supabase = await createClient()

    const { data: packages, error } = await supabase
        .from("packages")
        .select("*")
        .is("stripe_product_id", null) // Or switch to LEFT JOIN if needed in future

    if (error) throw new Error("Failed to fetch unsynced packages")

    for (const pkg of packages) {
        try {
            await syncPackageToStripe(pkg.id)
        } catch (err: any) {
            console.error(`Bulk sync failed for package ${pkg.slug}:`, err.message)
        }
    }

    return { status: "done" }
}