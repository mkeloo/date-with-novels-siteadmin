"use client"

import React, { useEffect, useState, useTransition } from "react"
import { getPackages, Packages } from "@/app/actions/siteadmin/packages"
import { getPackageTierById } from "@/app/actions/siteadmin/package_tier"
import { getThemeById } from "@/app/actions/siteadmin/themes"
import {
    getStripeSyncRecord,
    getStripeProductById,
    syncPackageToStripe,
} from "@/app/actions/siteadmin/syncUnsyncedPackagesStripe"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import LoadingPageSkeleton from "@/components/reusable/LoadingPageSkeleton"

type FieldStatus = "match" | "mismatch" | "missing"
interface SyncStatus {
    name: FieldStatus
    slug: FieldStatus
    price: FieldStatus
    theme: FieldStatus
    package_tier: FieldStatus
    allowed_genres: FieldStatus
    created_at: FieldStatus
    updated_at: FieldStatus
}

type StripeProductWithPrice = Awaited<ReturnType<typeof getStripeProductById>>

export default function StripePackagesSyncClient() {
    const [packages, setPackages] = useState<Packages[]>([])
    const [stripeData, setStripeData] = useState<Record<number, StripeProductWithPrice | null>>({})
    const [isPending, startTransition] = useTransition()
    const [themeMap, setThemeMap] = useState<Record<number, string>>({})
    const [tierMap, setTierMap] = useState<Record<number, string>>({})

    // on mount: load packages + their Stripe sync + product
    useEffect(() => {
        async function loadAll() {
            const pkgs = await getPackages()
            setPackages(pkgs)

            // Fetch stripe data in parallel
            const stripePromises = pkgs.map(async (pkg) => {
                const sync = await getStripeSyncRecord(pkg.id)
                if (sync?.stripe_product_id) {
                    return await getStripeProductById(sync.stripe_product_id)
                }
                return null
            })
            const stripeResults = await Promise.all(stripePromises)
            const data: Record<number, StripeProductWithPrice | null> = {}
            pkgs.forEach((pkg, i) => (data[pkg.id] = stripeResults[i]))
            setStripeData(data)

            // Now resolve theme/tier names
            const themes: Record<number, string> = {}
            const tiers: Record<number, string> = {}

            await Promise.all(pkgs.map(async (pkg) => {
                if (pkg.theme_id != null) {
                    const theme = await getThemeById(pkg.theme_id)
                    themes[pkg.id] = theme?.theme_name ?? "—"
                } else {
                    themes[pkg.id] = "—"
                }

                if (pkg.package_tier != null) {
                    const tier = await getPackageTierById(pkg.package_tier)
                    tiers[pkg.id] = tier?.name ?? "—"
                } else {
                    tiers[pkg.id] = "—"
                }
            }))

            setThemeMap(themes)
            setTierMap(tiers)
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

    if (
        packages.length === 0 ||
        Object.keys(stripeData).length < packages.length ||
        Object.keys(themeMap).length < packages.length ||
        Object.keys(tierMap).length < packages.length
    ) {
        return <LoadingPageSkeleton />
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
                    const themeName = themeMap[pkg.id] || "—"
                    const tierName = tierMap[pkg.id] || "—"
                    const status: SyncStatus = stripe
                        ? determineStatuses(pkg, stripe, themeName, tierName)
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

                            <CardContent>
                                <Table className="font-mono border-2">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="font-bold text-white">Database Data</TableHead>
                                            <TableHead className="font-bold text-white">Stripe Data</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow>
                                            {/* ——— Database column ——— */}
                                            <TableCell className="space-y-2">
                                                {renderField("Name", pkg.name, "match")}
                                                {renderField("Slug", pkg.slug, "match")}
                                                {renderField("Price", `$${pkg.price.toFixed(2)}`, "match")}
                                                {renderField("Theme", themeName, "match")}
                                                {renderField("Tier", tierName, "match")}
                                                {renderField("Allowed Genres", pkg.allowed_genres.join(", "), "match")}
                                                {renderField("Created At", pkg.created_at, "match")}
                                                {renderField("Updated At", pkg.updated_at, "match")}
                                            </TableCell>

                                            {/* ——— Stripe column ——— */}
                                            <TableCell className="space-y-2">
                                                {renderField(
                                                    "Name",
                                                    stripe?.name ?? "—",
                                                    status.name
                                                )}
                                                {renderField(
                                                    "Slug",
                                                    stripe?.metadata?.slug ?? "—",
                                                    status.slug
                                                )}
                                                {renderField(
                                                    "Price",
                                                    stripe?.price
                                                        ? `$${(stripe.price.unit_amount! / 100).toFixed(2)}`
                                                        : "—",
                                                    status.price
                                                )}
                                                {renderField(
                                                    "Theme",
                                                    stripe?.metadata?.theme ?? "—",
                                                    status.theme
                                                )}
                                                {renderField(
                                                    "Tier",
                                                    stripe?.metadata?.package_tier ?? "—",
                                                    status.package_tier
                                                )}
                                                {renderField(
                                                    "Allowed Genres",
                                                    stripe?.metadata?.allowed_genres ?? "—",
                                                    status.allowed_genres
                                                )}
                                                {renderField(
                                                    "Created At",
                                                    stripe?.metadata?.created_at ?? "—",
                                                    status.created_at
                                                )}
                                                {renderField(
                                                    "Updated At",
                                                    stripe?.metadata?.updated_at ?? "—",
                                                    status.updated_at
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
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

    // Field renderer
    function renderField(label: string, value: string, status: FieldStatus) {
        const bg = {
            match: "bg-green-500/30",
            mismatch: "bg-red-500/40",
            missing: "bg-muted",
        }[status]
        return (
            <div className={cn("text-sm  px-3 py-1.5", bg)}>
                <span className="font-semibold">{label}:</span> <span className="ml-1">{value}</span>
            </div>
        )
    }

    // All‐missing fallback
    function createMissingStatuses(): SyncStatus {
        return {
            name: "missing",
            slug: "missing",
            price: "missing",
            theme: "missing",
            package_tier: "missing",
            allowed_genres: "missing",
            created_at: "missing",
            updated_at: "missing",
        }
    }

    // Compare DB vs. Stripe
    function determineStatuses(
        pkg: Packages,
        stripe: StripeProductWithPrice,
        themeName: string,
        tierName: string
    ): SyncStatus {
        const cmp = (a?: string, b?: string): FieldStatus => (a === b ? "match" : "mismatch")

        return {
            name: cmp(pkg.name, stripe?.name),
            slug: cmp(pkg.slug, stripe?.metadata?.slug),
            price: stripe?.price
                ? (stripe.price.unit_amount === Math.round(pkg.price * 100)
                    ? "match"
                    : "mismatch")
                : "missing",
            theme: cmp(themeName, stripe?.metadata?.theme),
            package_tier: cmp(tierName, stripe?.metadata?.package_tier),
            allowed_genres: cmp(pkg.allowed_genres.join(", "), stripe?.metadata?.allowed_genres),
            created_at: cmp(pkg.created_at, stripe?.metadata?.created_at),
            updated_at: cmp(pkg.updated_at, stripe?.metadata?.updated_at),
        }
    }
}