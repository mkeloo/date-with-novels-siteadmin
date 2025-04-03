"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import { getPackages, deletePackages, Packages } from "@/app/actions/siteadmin/packages"
import { getPackageTierById } from "@/app/actions/siteadmin/package_tier"
import LucideIcon from "@/components/reusable/LucideIcon"
import PackageMoreInfoDialog from "@/components/reusable/Dialogs/PackageMoreInfoDialog"


export default function PackagesOverviewPage() {
    const [packages, setPackages] = useState<Packages[]>([])
    const [loading, setLoading] = useState(true)
    const [showDelete, setShowDelete] = useState(false)
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
    const [packageTierName, setPackageTierName] = useState<Record<number, string>>({})

    // Fetch packages on mount
    // useEffect(() => {
    //     const fetchAllPackages = async () => {
    //         try {
    //             const res = await getPackages()
    //             setPackages(res)
    //         } catch (err) {
    //             console.error("Failed to fetch packages:", err)
    //         } finally {
    //             setLoading(false)
    //         }
    //     }
    //     fetchAllPackages()
    // }, [])

    useEffect(() => {
        const fetchAllPackages = async () => {
            try {
                const res = await getPackages()
                setPackages(res)

                const tierIdSet = new Set(res.map((pkg) => pkg.package_tier))
                const tierNameMap: Record<number, string> = {}

                for (const id of tierIdSet) {
                    try {
                        const tier = await getPackageTierById(id)
                        tierNameMap[id] = tier.name
                    } catch (err) {
                        console.error(`Failed to get package tier name for ID ${id}`, err)
                        tierNameMap[id] = "Unknown Tier"
                    }
                }

                setPackageTierName(tierNameMap)
            } catch (err) {
                console.error("Failed to fetch packages:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchAllPackages()
    }, [])

    const handleDelete = async (id: number) => {
        try {
            await deletePackages(id)
            setConfirmDeleteId(null)
        } catch (err) {
            console.error("Failed to delete package package:", err)
        }
    }

    if (loading) return <p>Loading packages...</p>

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
                {packages.map((packageItem) => (
                    <Card key={packageItem.id} className="p-4 space-y-2 relative">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">{packageItem.name}</h2>
                            <LucideIcon iconName={packageItem.icon_name} className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">{packageItem.short_description}</p>

                        <div className="text-sm text-muted-foreground space-y-1">
                            <p><strong>Price:</strong> ${packageItem.price.toFixed(2)}</p>
                            <p><strong>Updated:</strong> {format(new Date(packageItem.updated_at), "PPpp")}</p>
                            <p><strong>Package Tier:</strong> {packageTierName[packageItem.package_tier] || "Loading..."}</p>
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
                                        <h2 className="text-xl font-semibold">{packageItem.name}</h2>
                                        <LucideIcon iconName={packageItem.icon_name} className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    {/* Render our dialog content body for this packageItem */}
                                    <PackageMoreInfoDialog tier={packageItem} />
                                </DialogContent>
                            </Dialog>

                            <Link href={`/dashboard/product-settings/packages/package-tier-form?mode=edit&id=${packageItem.id}`}>
                                <Button size="sm" variant="secondary">Edit</Button>
                            </Link>

                            {showDelete && (
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => setConfirmDeleteId(packageItem.id)}
                                >
                                    Delete
                                </Button>
                            )}
                        </div>

                        {/* Delete Confirmation Dialog */}
                        <Dialog open={confirmDeleteId === packageItem.id} onOpenChange={() => setConfirmDeleteId(null)}>
                            <DialogContent className="max-w-md">
                                <DialogTitle className="text-lg font-semibold">Confirm Deletion</DialogTitle>
                                <p>Are you sure you want to delete <strong>{packageItem.name}</strong>? This action cannot be undone.</p>
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
                                    <Button variant="destructive" onClick={() => handleDelete(packageItem.id)}>Confirm Delete</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </Card>
                ))}
            </div>
        </div>
    )
}