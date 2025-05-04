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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
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
import LoadingSkeletonStripe from "@/components/skeleton/LoadingSkeletonStripe"

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

    /* helper: tier‑id → readable name */
    const tierName = (id: number) => tierMap[id] ?? `Tier ${id}`


    /* group once so we can iterate twice */
    const grouped = packages.reduce<Record<number, Packages[]>>((acc, p) => {
        (acc[p.package_tier] ??= []).push(p)
        return acc
    }, {})

    /* sorted tier keys */
    const tierKeys = Object.keys(grouped).map(Number).sort((a, b) => a - b)

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
                    const name = tier?.name ?? `Tier ${pkg.package_tier}`

                    tiers[pkg.package_tier] = name   // key by tier‑ID (works for Tabs)
                    tiers[pkg.id] = name   // (optional) keep old key for table rows
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
        return <LoadingSkeletonStripe />
    }

    return (
        <div className="w-full h-full p-4 flex flex-col gap-4">
            <Card className="p-4 flex flex-row justify-center items-center">
                <h1 className="text-2xl font-bold">Stripe Packages Sync</h1>
                {/* <Button variant="outline" disabled={isPending}>
                    Sync All
                </Button> */}
            </Card>

            {/* ───────── Tabs per Package‑Tier ───────── */}
            <Tabs defaultValue={tierKeys[0]?.toString()} className="mt-6 space-y-6">

                {/* tab bar */}
                <TabsList className="mx-auto flex flex-wrap justify-center gap-2 rounded-xl bg-muted p-1">
                    {tierKeys.map(id => (
                        <TabsTrigger
                            key={id}
                            value={id.toString()}
                            className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-xl px-6 py-2 font-semibold text-sm md:text-base"
                        >
                            {tierName(id)}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* tab panels */}
                {tierKeys.map(id => (
                    <TabsContent key={id} value={id.toString()} className="space-y-6">
                        {grouped[id].map(pkg => {
                            const stripe = stripeData[pkg.id]
                            const themeName = themeMap[pkg.id] || "—"
                            const tierName = tierMap[pkg.id] || "—"
                            const status: SyncStatus = stripe
                                ? determineStatuses(pkg, stripe, themeName, tierName)
                                : createMissingStatuses()

                            const hasMismatch = Object.values(status).some((s) => s !== "match")

                            return (
                                <Card key={pkg.id} className="p-4 space-y-4">
                                    <CardHeader className="flex justify-between items-center p-0">
                                        <CardTitle>{pkg.name}</CardTitle>
                                        <Button size="sm" onClick={() => handleSync(pkg)} disabled={isPending}>
                                            Sync
                                        </Button>
                                    </CardHeader>

                                    <CardContent className="p-0">
                                        <Table className="table-fixed w-full font-mono border-2">
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-1/2 font-semibold text-white px-3">
                                                        Database
                                                    </TableHead>
                                                    <TableHead className="w-1/2 font-semibold text-white px-3">
                                                        Stripe
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow>
                                                    {/* ——— Database column ——— */}
                                                    <TableCell className="space-y-2 whitespace-normal break-words">
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
                                                    <TableCell className="space-y-2 whitespace-normal break-words">
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
                    </TabsContent>
                ))}
            </Tabs>

            {/* ───────── All Packages ───────── */}
            <Card className="p-4 flex justify-center items-start gap-y-2 bg-muted mt-8">
                <h2 className="text-xl font-bold">All Packages</h2>
                <p className="text-sm text-muted-foreground">
                    This is a list of all packages in the database. You can sync them with Stripe by clicking the Sync button.
                </p>
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
                                <Table className="table-fixed w-full font-mono border-2">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="font-bold text-white px-3">Database Data</TableHead>
                                            <TableHead className="font-bold text-white px-3">Stripe Data</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow>
                                            {/* ——— Database column ——— */}
                                            <TableCell className="space-y-2 whitespace-normal break-words">
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
                                            <TableCell className="space-y-2 whitespace-normal break-words">
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