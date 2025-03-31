"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import LucideIcon from "@/components/reusable/LucideIcon"
import { getPackageTiers } from "@/app/actions/siteadmin/packageTiers"
import type { PackageTier } from "@/app/actions/siteadmin/packageTiers"

export default function ClassicEditionPage() {
    const [tiers, setTiers] = useState<PackageTier[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTiers = async () => {
            const res = await getPackageTiers()
            const filtered = res.filter((tier) => tier.tier_type === "classic")
            setTiers(filtered)
            setLoading(false)
        }

        fetchTiers()
    }, [])

    if (loading) return <p>Loading classic edition packages...</p>

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Classic Edition Packages</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tiers.map((tier) => (
                    <Card key={tier.id} className="p-4 space-y-2 relative">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">{tier.name}</h2>
                            <LucideIcon iconName={tier.icon_name} className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">{tier.short_description}</p>

                        <div className="text-sm text-muted-foreground space-y-1">
                            <p><strong>Price:</strong> ${tier.price.toFixed(2)}</p>
                            <p><strong>Updated:</strong> {format(new Date(tier.updated_at), "PPpp")}</p>
                        </div>

                        <div className="w-full flex items-center justify-between gap-2">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button size="sm" variant="secondary">More Info</Button>
                                </DialogTrigger>
                                <VisuallyHidden.Root>
                                    <DialogTitle>More Info</DialogTitle>
                                </VisuallyHidden.Root>
                                <DialogContent className="max-w-lg space-y-4">
                                    <h2 className="text-lg font-semibold">{tier.name}</h2>
                                    <p><strong>Slug:</strong> {tier.slug}</p>
                                    <p><strong>Genres:</strong> {tier.allowed_genres.join(", ")}</p>
                                    <p><strong>Package Contents:</strong></p>
                                    <ul className="list-disc pl-5">
                                        {tier.package_contents?.map((item, idx) => (
                                            <li key={idx}>{item}</li>
                                        ))}
                                    </ul>
                                </DialogContent>
                            </Dialog>

                            <Link href={`/dashboard/manage-pages/classic-edition/${tier.slug}/add-content`}>
                                <Button size="sm" variant="default">Add Content</Button>
                            </Link>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}