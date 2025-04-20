"use client"

import React, { useEffect, useState, useTransition } from "react"
import { getPackages, Packages } from "@/app/actions/siteadmin/packages"
import {
    getStripeSyncRecord,
    getStripeProductById,
    PackageStripeSync,
    syncPackageToStripe,
} from "@/app/actions/siteadmin/syncUnsyncedPackagesStripe"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type FieldStatus = "match" | "mismatch" | "missing"

type StripeProductWithPrice = Awaited<ReturnType<typeof getStripeProductById>>

export default function StripePackagesSyncClient() {
    const [packages, setPackages] = useState<Packages[]>([])
    const [stripeData, setStripeData] = useState<Record<number, StripeProductWithPrice | null>>({})
    const [isPending, startTransition] = useTransition()

    useEffect(() => {
        async function fetchData() {
            const pkgs = await getPackages()
            setPackages(pkgs)

            const data: Record<number, StripeProductWithPrice | null> = {}
            for (const pkg of pkgs) {
                const sync = await getStripeSyncRecord(pkg.id)
                if (sync?.stripe_product_id) {
                    const product = await getStripeProductById(sync.stripe_product_id)
                    data[pkg.id] = product
                } else {
                    data[pkg.id] = null
                }
            }

            setStripeData(data)
        }

        fetchData()
    }, [])

    const handleSync = (pkg: Packages) => {
        startTransition(async () => {
            await syncPackageToStripe(pkg.id)
            const sync = await getStripeSyncRecord(pkg.id)
            if (sync?.stripe_product_id) {
                const updated = await getStripeProductById(sync.stripe_product_id)
                setStripeData(prev => ({ ...prev, [pkg.id]: updated }))
            }
        })
    }

    return (
        <div className="w-full h-full p-4 flex flex-col gap-4">
            <Card className="p-4 flex flex-row items-center justify-between">
                <h1 className="text-2xl font-bold">Stripe Packages Sync</h1>
                <div className="flex gap-2">
                    <Button variant="outline" disableLoader>Sync All (TODO)</Button>
                </div>
            </Card>

            <div className="grid gap-4">
                {packages.map((pkg) => {
                    const stripe = stripeData[pkg.id]
                    const syncStatus = stripe ? determineFieldStatuses(pkg, stripe) : createMissingStatuses()
                    const hasWarning = Object.values(syncStatus).some(s => s !== "match")

                    return (
                        <Card key={pkg.id} className="p-4 flex flex-col gap-4">
                            <CardHeader className="flex items-center justify-between">
                                <CardTitle className="text-lg">{pkg.name}</CardTitle>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => handleSync(pkg)}
                                    disabled={isPending}
                                >
                                    Sync
                                </Button>
                            </CardHeader>

                            <CardContent className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-sm font-semibold text-muted-foreground mb-1">Database</h3>
                                    {renderField("Name", pkg.name, "match")}
                                    {renderField("Slug", pkg.slug, "match")}
                                    {renderField("Price", `$${pkg.price.toFixed(2)}`, "match")}
                                    {renderField("Supports Themed", pkg.supports_themed ? "Yes" : "No", "match")}
                                    {renderField("Supports Regular", pkg.supports_regular ? "Yes" : "No", "match")}
                                    {renderField("Theme ID", pkg.theme_id?.toString() || "-", "match")}
                                    {renderField("Tier", pkg.package_tier?.toString() || "-", "match")}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <h3 className="text-sm font-semibold text-muted-foreground mb-1">Stripe</h3>
                                    {renderField("Name", stripe?.name ?? "—", syncStatus.name)}
                                    {renderField("Slug", stripe?.metadata?.slug ?? "—", syncStatus.slug)}
                                    {renderField("Price", stripe?.price ? `$${(stripe.price.unit_amount / 100).toFixed(2)}` : "—", syncStatus.price)}
                                    {renderField("Supports Themed", stripe?.metadata?.supports_themed ?? "—", syncStatus.supports_themed)}
                                    {renderField("Supports Regular", stripe?.metadata?.supports_regular ?? "—", syncStatus.supports_regular)}
                                    {renderField("Theme ID", stripe?.metadata?.theme_id ?? "—", syncStatus.theme_id)}
                                    {renderField("Tier", stripe?.metadata?.package_tier ?? "—", syncStatus.package_tier)}
                                </div>
                            </CardContent>

                            {hasWarning && (
                                <div className="rounded-md bg-red-200 px-4 py-2 text-sm text-red-900 font-medium">
                                    One or more fields are missing or mismatched. Please sync this package to update Stripe.
                                </div>
                            )}
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}

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

function createMissingStatuses(): Record<string, FieldStatus> {
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

function determineFieldStatuses(pkg: Packages, stripe: StripeProductWithPrice): Record<string, FieldStatus> {
    const compare = (a: string | undefined, b: string | undefined): FieldStatus =>
        a === b ? "match" : "mismatch"

    return {
        name: compare(pkg.name, stripe?.name),
        slug: compare(pkg.slug, stripe?.metadata?.slug),
        price: stripe?.price
            ? Math.round(pkg.price * 100).toString() === stripe.price.unit_amount.toString()
                ? "match"
                : "mismatch"
            : "missing",
        supports_themed: compare(pkg.supports_themed ? "true" : "false", stripe?.metadata?.supports_themed),
        supports_regular: compare(pkg.supports_regular ? "true" : "false", stripe?.metadata?.supports_regular),
        theme_id: compare(pkg.theme_id?.toString(), stripe?.metadata?.theme_id),
        package_tier: compare(pkg.package_tier?.toString(), stripe?.metadata?.package_tier),
    }
}