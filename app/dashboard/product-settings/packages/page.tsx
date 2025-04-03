"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import { getPackages, deletePackages } from "../../../actions/siteadmin/packages"
import LucideIcon from "@/components/reusable/LucideIcon"
import type { Packages } from "../../../actions/siteadmin/packages"

export default function PackagesOverviewPage() {
    const [tiers, setTiers] = useState<Packages[]>([])
    const [loading, setLoading] = useState(true)
    const [showDelete, setShowDelete] = useState(false)
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

    // Fetch tiers on mount
    useEffect(() => {
        const fetchTiers = async () => {
            try {
                const res = await getPackages()
                setTiers(res)
            } catch (err) {
                console.error("Failed to fetch package tiers:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchTiers()
    }, [])

    const handleDelete = async (id: number) => {
        try {
            await deletePackages(id)
            setTiers((prev) => prev.filter((tier) => tier.id !== id))
            setConfirmDeleteId(null)
        } catch (err) {
            console.error("Failed to delete package tier:", err)
            alert("Failed to delete package.")
        }
    }

    if (loading) return <p>Loading package tiers...</p>

    return (
        <div className="space-y-6">
            {/* Header + Create + Toggle Delete */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Packages</h1>
                <div className="flex items-center gap-2">
                    <Link href="/dashboard/product-settings/packages/package-tier-form?mode=create">
                        <Button variant="outline">Create New Package</Button>
                    </Link>
                    <Button
                        variant={showDelete ? "destructive" : "outline"}
                        onClick={() => setShowDelete((prev) => !prev)}
                    >
                        {showDelete ? "Cancel Delete" : "Delete Packages"}
                    </Button>
                </div>
            </div>

            {/* Package Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tiers.map((tier) => (
                    <Card key={tier.id} className="p-4 space-y-2 relative">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">{tier.name}</h2>
                            <LucideIcon iconName={tier.icon_name} className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">{tier.short_description}</p>

                        <div className="text-sm text-muted-foreground space-y-1">
                            {/* <p><strong>Tier:</strong> {tier.tier_type.replace("_", " ")}</p> */}
                            <p><strong>Price:</strong> ${tier.price.toFixed(2)}</p>
                            <p><strong>Updated:</strong> {format(new Date(tier.updated_at), "PPpp")}</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="w-full flex items-center justify-between gap-2">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button disableLoader size="sm" variant="secondary">More Info</Button>
                                </DialogTrigger>

                                <VisuallyHidden.Root>
                                    <DialogTitle>More Information</DialogTitle>
                                </VisuallyHidden.Root>
                                <DialogContent className="max-w-lg space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-semibold">{tier.name}</h2>
                                        <LucideIcon iconName={tier.icon_name} className="w-6 h-6 text-muted-foreground" />
                                    </div>

                                    <div className="text-sm space-y-1">
                                        <p><strong>Slug:</strong> {tier.slug}</p>
                                        <p><strong>Enabled:</strong> {tier.is_enabled ? "Yes" : "No"}</p>
                                        <p><strong>Sort Order:</strong> {tier.sort}</p>
                                        <p><strong>Icon Name:</strong> {tier.icon_name}</p>
                                        {/* <p><strong>Tier Type:</strong> {tier.tier_type}</p> */}
                                        <p><strong>Theme ID:</strong> {tier.theme_id ?? "None"}</p>
                                        <p><strong>Supports Themed:</strong> {tier.supports_themed ? "Yes" : "No"}</p>
                                        <p><strong>Supports Regular:</strong> {tier.supports_regular ? "Yes" : "No"}</p>
                                        <p><strong>Description:</strong> {tier.short_description}</p>
                                        <p><strong>Price:</strong> ${tier.price.toFixed(2)}</p>
                                        <p><strong>Genres:</strong> {tier.allowed_genres.join(", ")}</p>
                                        <p><strong>Package Contents:</strong></p>
                                        <ul className="list-disc pl-5">
                                            {tier.package_contents?.map((item, idx) => (
                                                <li key={idx}>{item}</li>
                                            ))}
                                        </ul>
                                        <p className="text-xs text-muted-foreground">
                                            Last Updated: {format(new Date(tier.updated_at), "PPpp")}
                                        </p>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            <Link href={`/dashboard/product-settings/packages/package-tier-form?mode=edit&id=${tier.id}`}>
                                <Button size="sm" variant="secondary">Edit</Button>
                            </Link>

                            {showDelete && (
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => setConfirmDeleteId(tier.id)}
                                >
                                    Delete
                                </Button>
                            )}
                        </div>

                        {/* Delete Confirmation Dialog */}
                        <Dialog open={confirmDeleteId === tier.id} onOpenChange={() => setConfirmDeleteId(null)}>
                            <DialogContent className="max-w-md">
                                <DialogTitle className="text-lg font-semibold">
                                    Confirm Deletion
                                </DialogTitle>
                                <p>Are you sure you want to delete <strong>{tier.name}</strong>? This action cannot be undone.</p>
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>
                                        Cancel
                                    </Button>
                                    <Button variant="destructive" onClick={() => handleDelete(tier.id)}>
                                        Confirm Delete
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </Card>
                ))}
            </div>
        </div>
    )
}