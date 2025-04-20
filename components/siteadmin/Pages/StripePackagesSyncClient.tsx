"use client"

import React, { useEffect, useState } from "react"
import { getPackages } from "@/app/actions/siteadmin/packages"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Packages } from "@/app/actions/siteadmin/packages"

type FieldStatus = "match" | "mismatch" | "missing"

export default function StripePackagesSyncClient() {
    const [packages, setPackages] = useState<Packages[]>([])

    useEffect(() => {
        async function fetchPackages() {
            const data = await getPackages()
            setPackages(data)
        }

        fetchPackages()
    }, [])

    return (
        <div className="w-full h-full p-4 flex flex-col gap-4">
            {/* Page Header */}
            <Card className="p-4 flex flex-row items-center justify-between">
                <h1 className="text-2xl font-bold">Stripe Packages Sync</h1>
                <div className="flex gap-2">
                    <Button variant="outline" disableLoader>Sync All (dummy)</Button>
                </div>
            </Card>

            {/* Packages Comparison List */}
            <div className="grid gap-4">
                {packages.map((pkg) => {
                    // Define dummy status array for Stripe (to simulate diffing logic later)
                    const stripeStatuses: FieldStatus[] = [
                        "mismatch", // name
                        "missing",  // slug
                        "missing",  // price
                        "missing",  // supports themed
                        "missing",  // supports regular
                        "missing",  // theme ID
                        "missing",  // tier
                    ]

                    const hasWarning = stripeStatuses.some(status => status !== "match")

                    return (
                        <Card key={pkg.id} className="p-4 flex flex-col gap-4">
                            <CardHeader className="flex items-center justify-between">
                                <CardTitle className="text-lg">{pkg.name}</CardTitle>
                                <Button disableLoader variant="default" size="sm">Sync</Button>
                            </CardHeader>

                            <CardContent className="grid grid-cols-2 gap-4">
                                {/* Left: DB Data */}
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

                                {/* Right: Stripe Data (Dummy for now) */}
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-sm font-semibold text-muted-foreground mb-1">Stripe</h3>
                                    {renderField("Name", "—", "mismatch")}
                                    {renderField("Slug", "—", "missing")}
                                    {renderField("Price", "—", "missing")}
                                    {renderField("Supports Themed", "—", "missing")}
                                    {renderField("Supports Regular", "—", "missing")}
                                    {renderField("Theme ID", "—", "missing")}
                                    {renderField("Tier", "—", "missing")}
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

// Field rendering with status color
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