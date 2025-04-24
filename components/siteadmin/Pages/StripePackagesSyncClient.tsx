"use client"

import React, { useEffect, useState, useTransition } from "react"
import { getPackages, Packages } from "@/app/actions/siteadmin/packages"
import {
    getStripeSyncRecord,
    getStripeProductById,
    syncPackageToStripe,
} from "@/app/actions/siteadmin/syncUnsyncedPackagesStripe"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type FieldStatus = "match" | "mismatch" | "missing"
interface SyncStatus {
    name: FieldStatus
    slug: FieldStatus
    price: FieldStatus
    supports_themed: FieldStatus
    supports_regular: FieldStatus
    theme_id: FieldStatus
    package_tier: FieldStatus
}

type StripeProductWithPrice = Awaited<ReturnType<typeof getStripeProductById>>

export default function StripePackagesSyncClient() {
    const [packages, setPackages] = useState<Packages[]>([])
    const [stripeData, setStripeData] = useState<Record<number, StripeProductWithPrice | null>>({})
    const [isPending, startTransition] = useTransition()

    // on mount: load packages + their Stripe sync + product
    useEffect(() => {
        async function loadAll() {
            try {
                const pkgs = await getPackages()
                setPackages(pkgs)

                const data: Record<number, StripeProductWithPrice | null> = {}
                for (const pkg of pkgs) {
                    const sync = await getStripeSyncRecord(pkg.id)
                    if (sync?.stripe_product_id) {
                        data[pkg.id] = await getStripeProductById(sync.stripe_product_id)
                    } else {
                        data[pkg.id] = null
                    }
                }
                setStripeData(data)
            } catch (err) {
                console.error("Failed to load packages or Stripe data", err)
            }
        }
        loadAll()
    }, [])

    // wrapper to sync a single package
    const handleSync = (pkg: Packages) => {
        startTransition(async () => {
            try {
                await syncPackageToStripe(pkg.id)
                const updatedSync = await getStripeSyncRecord(pkg.id)
                if (updatedSync?.stripe_product_id) {
                    const prod = await getStripeProductById(updatedSync.stripe_product_id)
                    setStripeData((prev) => ({ ...prev, [pkg.id]: prod }))
                }
            } catch (err) {
                console.error(`Failed to sync package ${pkg.id}`, err)
            }
        })
    }

    return (
        <div className="w-full h-full p-4 flex flex-col gap-4">
            <Card className="p-4 flex flex-row justify-between items-center">
                <h1 className="text-2xl font-bold">Stripe Packages Sync</h1>
                <Button variant="outline" disabled={isPending}>
                    Sync All
                </Button>
            </Card>

            <div className="grid gap-4">
                {packages.map((pkg) => {
                    const stripe = stripeData[pkg.id]
                    const status: SyncStatus = stripe
                        ? determineStatuses(pkg, stripe)
                        : createMissingStatuses()

                    const hasMismatch = Object.values(status).some((s) => s !== "match")

                    return (
                        <Card key={pkg.id} className="p-4 flex flex-col gap-4">
                            <CardHeader className="flex justify-between items-center">
                                <CardTitle>{pkg.name}</CardTitle>
                                <Button size="sm" onClick={() => handleSync(pkg)} disabled={isPending}>
                                    Sync
                                </Button>
                            </CardHeader>

                            <CardContent className="grid grid-cols-2 gap-4">
                                {/* DB side */}
                                <div className="flex flex-col gap-2">
                                    <h3 className="font-semibold text-sm mb-1">Database</h3>
                                    {renderField("Name", pkg.name, "match")}
                                    {renderField("Slug", pkg.slug, "match")}
                                    {renderField("Price", `$${pkg.price.toFixed(2)}`, "match")}
                                    {renderField("Supports Themed", pkg.supports_themed ? "Yes" : "No", "match")}
                                    {renderField("Supports Regular", pkg.supports_regular ? "Yes" : "No", "match")}
                                    {renderField("Theme ID", pkg.theme_id?.toString() || "-", "match")}
                                    {renderField("Tier", pkg.package_tier?.toString() || "-", "match")}
                                </div>

                                {/* Stripe side */}
                                <div className="flex flex-col gap-2">
                                    <h3 className="font-semibold text-sm mb-1">Stripe</h3>
                                    {renderField("Name", stripe?.name ?? "—", status.name)}
                                    {renderField("Slug", stripe?.metadata?.slug ?? "—", status.slug)}
                                    {renderField(
                                        "Price",
                                        stripe?.price ? `$${(stripe.price.unit_amount / 100).toFixed(2)}` : "—",
                                        status.price
                                    )}
                                    {renderField(
                                        "Supports Themed",
                                        stripe?.metadata?.supports_themed ?? "—",
                                        status.supports_themed
                                    )}
                                    {renderField(
                                        "Supports Regular",
                                        stripe?.metadata?.supports_regular ?? "—",
                                        status.supports_regular
                                    )}
                                    {renderField("Theme ID", stripe?.metadata?.theme_id ?? "—", status.theme_id)}
                                    {renderField("Tier", stripe?.metadata?.package_tier ?? "—", status.package_tier)}
                                </div>
                            </CardContent>

                            {hasMismatch && (
                                <div className="rounded-md bg-red-200 px-4 py-2 text-red-900 font-medium">
                                    One or more fields are missing or mismatched. Please sync this package.
                                </div>
                            )}
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}

// Field renderer
function renderField(label: string, value: string, status: FieldStatus) {
    const bg = {
        match: "bg-green-500/40",
        mismatch: "bg-red-500/40",
        missing: "bg-muted",
    }[status]
    return (
        <div className={cn("text-sm rounded-md px-3 py-2", bg)}>
            <span className="font-medium">{label}:</span> <span className="ml-1">{value}</span>
        </div>
    )
}

// All‐missing fallback
function createMissingStatuses(): SyncStatus {
    return {
        name: "missing",
        slug: "missing",
        price: "missing",
        supports_themed: "missing",
        supports_regular: "missing",
        theme_id: "missing",
        package_tier: "missing",
    }
}

// Compare DB vs. Stripe
function determineStatuses(pkg: Packages, stripe: StripeProductWithPrice): SyncStatus {
    const cmp = (a?: string, b?: string): FieldStatus => (a === b ? "match" : "mismatch")

    return {
        name: cmp(pkg.name, stripe?.name),
        slug: cmp(pkg.slug, stripe?.metadata.slug),
        price: stripe?.price
            ? stripe.price.unit_amount !== null && Math.round(pkg.price * 100).toString() === stripe.price.unit_amount.toString()
                ? "match"
                : "mismatch"
            : "missing",
        supports_themed: cmp(pkg.supports_themed ? "true" : "false", stripe?.metadata.supports_themed),
        supports_regular: cmp(pkg.supports_regular ? "true" : "false", stripe?.metadata.supports_regular),
        theme_id: cmp(pkg.theme_id?.toString(), stripe?.metadata.theme_id),
        package_tier: cmp(pkg.package_tier?.toString(), stripe?.metadata.package_tier),
    }
}