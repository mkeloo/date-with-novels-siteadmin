"use client"

import React, { useState, useEffect } from "react"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { z } from "zod"

import {
    PackageTier,
    getPackageTiers,
    getPackageTierById,
    createPackageTier,
    updatePackageTier,
    deletePackageTier,
} from "@/app/actions/siteadmin/package_tier"
import LucideIcon from "@/components/reusable/LucideIcon"
import { DialogDescription } from "@radix-ui/react-dialog"
import LoadingPageSkeleton from "@/components/reusable/LoadingPageSkeleton"

// Define a Zod schema for the package tier form.
const packageTierFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required"),
    short_description: z.string().optional(),
    long_description: z.string().optional(),
    icon_name: z.string().optional(),
    supports_themed: z.boolean(),
    supports_regular: z.boolean(),
})

type PackageTierFormData = z.infer<typeof packageTierFormSchema>

export default function PackageTiersPage() {
    const router = useRouter()

    // List of package tiers and loading state.
    const [tiers, setTiers] = useState<PackageTier[]>([])
    const [loading, setLoading] = useState(true)

    // States for our dialogs:
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [currentTier, setCurrentTier] = useState<PackageTier | null>(null)
    const [deleteDialogTierId, setDeleteDialogTierId] = useState<number | null>(null)
    const [infoDialogTierId, setInfoDialogTierId] = useState<number | null>(null)

    // Form state for create/edit
    const [formData, setFormData] = useState<PackageTierFormData>({
        name: "",
        slug: "",
        short_description: "",
        long_description: "",
        icon_name: "",
        supports_themed: false,
        supports_regular: false,
    })
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    // Fetch all package tiers on mount.
    useEffect(() => {
        async function fetchTiers() {
            try {
                const data = await getPackageTiers()
                setTiers(data)
            } catch (error) {
                console.error("Failed to fetch package tiers:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchTiers()
    }, [])

    // When user clicks "Create New Tier", open the edit dialog with empty data.
    const handleCreate = () => {
        setCurrentTier(null)
        setFormData({
            name: "",
            slug: "",
            short_description: "",
            long_description: "",
            icon_name: "",
            supports_themed: false,
            supports_regular: false,
        })
        setFormErrors({})
        setEditDialogOpen(true)
    }

    // When user clicks "Edit", prefill the form with the tier data.
    const handleEdit = async (id: number) => {
        try {
            const tier = await getPackageTierById(id)
            setCurrentTier(tier)
            setFormData({
                name: tier.name,
                slug: tier.slug,
                short_description: tier.short_description || "",
                long_description: tier.long_description || "",
                icon_name: tier.icon_name || "",
                supports_themed: tier.supports_themed,
                supports_regular: tier.supports_regular,
            })
            setFormErrors({})
            setEditDialogOpen(true)
        } catch (error) {
            console.error("Failed to load tier for editing:", error)
        }
    }

    // Handle form submission for create/update.
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        // Validate payload using Zod.
        const result = packageTierFormSchema.safeParse(formData)
        if (!result.success) {
            const errors: Record<string, string> = {}
            for (const [field, messages] of Object.entries(result.error.formErrors.fieldErrors)) {
                if (messages && messages.length > 0) {
                    errors[field] = messages[0]
                }
            }
            setFormErrors(errors)
            return
        }
        setFormErrors({})
        try {
            if (currentTier) {
                // Edit mode.
                await updatePackageTier(currentTier.id, formData)
            } else {
                // Create mode.
                await createPackageTier([
                    {
                        ...formData,
                        short_description: formData.short_description ?? null,
                        long_description: formData.long_description ?? null,
                        icon_name: formData.icon_name ?? null,
                    },
                ])
            }
            // Refresh list.
            const data = await getPackageTiers()
            setTiers(data)
            setEditDialogOpen(false)
            router.refresh()
        } catch (error) {
            console.error("Error saving package tier:", error)
        }
    }

    // Handle deletion.
    const handleDelete = async () => {
        if (deleteDialogTierId === null) return
        try {
            await deletePackageTier(deleteDialogTierId)
            setTiers((prev) => prev.filter((t) => t.id !== deleteDialogTierId))
            setDeleteDialogTierId(null)
        } catch (error) {
            console.error("Error deleting tier:", error)
        }
    }


    if (loading) return <LoadingPageSkeleton />

    return (
        <div className="space-y-6 p-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Package Tiers</h1>
                <Button variant="outline" onClick={handleCreate}>
                    Create New Tier
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tiers.map((tier) => (
                    <Card key={tier.id} className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">{tier.name}</h2>
                            {tier.icon_name && <LucideIcon iconName={tier.icon_name} className="w-5 h-5 text-muted-foreground" />}
                        </div>
                        <p className="text-sm text-muted-foreground">{tier.short_description || "No description"}</p>
                        <div className="flex items-center justify-between gap-2">
                            {/* More Info Button */}
                            <Dialog
                                open={infoDialogTierId === tier.id}
                                onOpenChange={(isOpen) => setInfoDialogTierId(isOpen ? tier.id : null)}
                            >
                                <DialogTrigger asChild>
                                    <Button
                                        disableLoader
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => setInfoDialogTierId(tier.id)}
                                    >
                                        More Info
                                    </Button>
                                </DialogTrigger>

                                <VisuallyHidden.Root>
                                    <DialogTitle>Tier Details</DialogTitle>
                                    <DialogDescription>
                                        View and edit details for {tier.name}.
                                    </DialogDescription>
                                </VisuallyHidden.Root>

                                <DialogContent className="max-w-lg space-y-4">
                                    <div className="space-y-2">
                                        <p><strong>Name:</strong> {tier.name}</p>
                                        <p><strong>Slug:</strong> {tier.slug}</p>
                                        <p><strong>Short Description:</strong> {tier.short_description || "N/A"}</p>
                                        <p><strong>Long Description:</strong> {tier.long_description || "N/A"}</p>
                                        <p><strong>Icon:</strong> {tier.icon_name || "N/A"}</p>
                                        <p><strong>Supports Themed:</strong> {tier.supports_themed ? "Yes" : "No"}</p>
                                        <p><strong>Supports Regular:</strong> {tier.supports_regular ? "Yes" : "No"}</p>
                                        <p><strong>Updated:</strong> {new Date(tier.updated_at).toLocaleString()}</p>
                                    </div>
                                    <Button onClick={() => setInfoDialogTierId(null)}>Close</Button>
                                </DialogContent>
                            </Dialog>

                            {/* Edit Button */}
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleEdit(tier.id)}
                            >
                                Edit
                            </Button>

                            {/* Delete Button */}
                            <Dialog
                                open={deleteDialogTierId === tier.id}
                                onOpenChange={(isOpen) => {
                                    if (!isOpen) setDeleteDialogTierId(null)
                                }}
                            >
                                <DialogTrigger asChild>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => setDeleteDialogTierId(tier.id)}
                                    >
                                        Delete
                                    </Button>
                                </DialogTrigger>

                                <VisuallyHidden.Root>
                                    <DialogTitle>Confirm Deletion</DialogTitle>
                                </VisuallyHidden.Root>

                                <DialogContent className="max-w-md space-y-4">
                                    <p>
                                        Are you sure you want to delete <strong>{tier.name}</strong>? This action cannot be undone.
                                    </p>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" onClick={() => setDeleteDialogTierId(null)}>Cancel</Button>
                                        <Button
                                            variant="destructive"
                                            onClick={handleDelete}
                                        >
                                            Confirm Delete
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Edit/Create Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogTrigger asChild>
                    {/* Invisible trigger since we control the open state */}
                    <div></div>
                </DialogTrigger>
                <VisuallyHidden.Root>
                    <DialogTitle>{currentTier ? "Edit Tier" : "Create New Tier"}</DialogTitle>
                    <DialogDescription>
                        {currentTier ? "Edit the details of the package tier." : "Fill in the details to create a new package tier."}
                    </DialogDescription>
                </VisuallyHidden.Root>
                <DialogContent className="max-w-lg space-y-4">
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div className="flex flex-col">
                            <Label>Name *</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
                        </div>
                        <div className="flex flex-col">
                            <Label>Slug *</Label>
                            <Input
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            />
                            {formErrors.slug && <p className="text-red-500 text-sm">{formErrors.slug}</p>}
                        </div>
                        <div className="flex flex-col">
                            <Label>Short Description</Label>
                            <Input
                                value={formData.short_description}
                                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col">
                            <Label>Long Description</Label>
                            <Input
                                value={formData.long_description}
                                onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col">
                            <Label>Icon Name</Label>
                            <Input
                                value={formData.icon_name}
                                onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex flex-col">
                                <Label>Supports Themed</Label>
                                <Select
                                    value={formData.supports_themed ? "true" : "false"}
                                    onValueChange={(val) =>
                                        setFormData({ ...formData, supports_themed: val === "true" })
                                    }
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Yes</SelectItem>
                                        <SelectItem value="false">No</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col">
                                <Label>Supports Regular</Label>
                                <Select
                                    value={formData.supports_regular ? "true" : "false"}
                                    onValueChange={(val) =>
                                        setFormData({ ...formData, supports_regular: val === "true" })
                                    }
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Yes</SelectItem>
                                        <SelectItem value="false">No</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">{currentTier ? "Update Tier" : "Create Tier"}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}