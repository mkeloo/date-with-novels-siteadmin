"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { cn, slugify } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import ExampleListInput from "@/components/reusable/SortableList/ExampleListInput"
import LucideIcon from "@/components/reusable/LucideIcon"
import { getPackageTierById, PackageTier } from "../../../app/actions/siteadmin/packageTiers"

// Dummy data
const PACKAGE_TIERS = [
    { label: "First Chapter Edition", value: "first_chapter" },
    { label: "Classic Edition", value: "classic" },
    { label: "Themed Edition", value: "themed" },
]

const THEMES = [
    { label: "Regular", value: "1" },
    { label: "Valentine's", value: "2" },
    { label: "Nurse", value: "3" },
    { label: "Horror", value: "4" },
]

const GENRES = [
    "Romance", "Mystery", "Thriller", "Young Adult Fiction", "Fantasy", "Horror", "Surprise Me"
]

type PackageTierFormClientProps = {
    mode: "create" | "edit"
    packageId: string | null
}

export default function PackageTierFormClient({ mode, packageId }: PackageTierFormClientProps) {
    const [loading, setLoading] = useState(mode === "edit")
    const [isEnabled, setIsEnabled] = useState(false)
    const [tierType, setTierType] = useState("")
    const [theme, setTheme] = useState("")
    const [title, setTitle] = useState("")
    const [slug, setSlug] = useState("")
    const [shortDescription, setShortDescription] = useState("")
    const [price, setPrice] = useState("")
    const [genres, setGenres] = useState<string[]>([])
    const [iconName, setIconName] = useState("Book")

    const router = useRouter()


    useEffect(() => {
        const themeLabel = theme && THEMES.find(t => t.value === theme)?.label;
        setSlug(slugify(title + (themeLabel && themeLabel !== "Regular" ? ` ${themeLabel}` : "")));
    }, [title, theme]);

    useEffect(() => {
        async function fetchPackageTier(id: number) {
            try {
                const data: PackageTier = await getPackageTierById(id)
                setIsEnabled(data.is_enabled)
                setTierType(data.tier_type)
                setTheme(data.theme_id?.toString() || "")
                setTitle(data.name)
                setShortDescription(data.short_description)
                setPrice(data.price.toString())
                setGenres(data.allowed_genres)
                setIconName(data.icon_name)
                // handle package_contents later in ExampleListInput
            } catch (error) {
                console.error("Failed to fetch package tier:", error)
            } finally {
                setLoading(false)
            }
        }

        if (mode === "edit" && packageId) {
            fetchPackageTier(Number(packageId))
        } else {
            setLoading(false)
        }
    }, [mode, packageId])

    const toggleGenre = (genre: string) => {
        setGenres((prev) =>
            prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const payload = {
            is_enabled: isEnabled,
            tier_type: tierType as "first_chapter" | "classic" | "themed",
            theme_id: theme ? parseInt(theme) : null,
            name: title,
            slug,
            short_description: shortDescription,
            price: parseFloat(price),
            allowed_genres: genres,
            icon_name: iconName,
            supports_themed: tierType !== "classic", // add logic as per your needs
            supports_regular: tierType !== "themed", // add logic as per your needs
            sort: 0, // default or custom sort order
            package_contents: [], // Add actual data when ready
        }

        try {
            if (mode === "edit" && packageId) {
                const { updatePackageTier } = await import("../../../app/actions/siteadmin/packageTiers")
                await updatePackageTier(parseInt(packageId), payload)
            } else {
                const { createPackageTier } = await import("../../../app/actions/siteadmin/packageTiers")
                await createPackageTier(payload)
            }

            router.push("/dashboard/product-settings/package-tiers")
        } catch (error) {
            console.error("Submission error:", error)
            alert("Failed to save package tier.")
        }
    }

    if (loading) {
        return <div className="p-4">Loading package details...</div>
    }

    return (
        <form onSubmit={handleSubmit}>
            <Card className="w-full h-full p-6 gap-4 flex flex-col">
                <Card className="w-full flex flex-col lg:flex-row items-center justify-between p-4">
                    <h2 className="text-lg font-semibold">
                        {mode === "edit" ? "Edit Package" : "New Package"}
                    </h2>
                </Card>

                <div className="w-full flex flex-col lg:flex-row gap-4">
                    <Card className="w-full lg:w-1/2 flex flex-col p-4">
                        <div className="w-full flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Package Stuff</h2>
                            <div className="flex items-center gap-4">
                                <Label className="mb-0">Enabled</Label>
                                <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
                            </div>
                        </div>

                        <Label>Package Tier Type</Label>
                        <Select value={tierType} onValueChange={setTierType}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Tier" />
                            </SelectTrigger>
                            <SelectContent>
                                {PACKAGE_TIERS.map((t) => (
                                    <SelectItem key={t.value} value={t.value}>
                                        {t.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Label>Theme Type</Label>
                        <Select value={theme} onValueChange={setTheme}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Theme" />
                            </SelectTrigger>
                            <SelectContent>
                                {THEMES.map((t) => (
                                    <SelectItem key={t.value} value={t.value}>
                                        {t.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Card>

                    <Card className="w-full lg:w-1/2 p-4">
                        <h2 className="text-lg font-semibold">Genres</h2>
                        <div className="flex flex-wrap gap-3">
                            {GENRES.map((genre) => (
                                <button
                                    key={genre}
                                    type="button"
                                    className={cn(
                                        "px-3 py-2 rounded-full border text-sm transition",
                                        genres.includes(genre)
                                            ? "bg-blue-600 text-white border-blue-700"
                                            : "bg-muted text-muted-foreground"
                                    )}
                                    onClick={() => toggleGenre(genre)}
                                >
                                    {genre}
                                </button>
                            ))}
                        </div>

                        <div className="">
                            <Label className="flex items-center gap-3">
                                Icon
                                <a
                                    href="https://lucide.dev/icons"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-500 hover:underline"
                                >
                                    Browse icons ↗
                                </a>
                            </Label>

                            <div className="w-full flex items-center gap-3">
                                <Input
                                    value={iconName}
                                    onChange={(e) => setIconName(e.target.value)}
                                    placeholder="Enter Lucide icon name"
                                    className="w-full lg:w-1/2"
                                />
                                <div className="bg-background p-2 flex items-center justify-center gap-2 border rounded">
                                    <Label className="mb-0 text-muted-foreground">Preview</Label>
                                    <LucideIcon iconName={iconName} className="w-5 h-5 text-foreground hover:scale-110 hover:text-blue-300 transition duration-300" />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4">
                        <Label>Title</Label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} />

                        <Label>Slug</Label>
                        <Input value={slug} readOnly />
                    </Card>

                    <Card className="p-4">
                        <Label>Price ($)</Label>
                        <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />

                        <Label>Description</Label>
                        <Input
                            value={shortDescription}
                            maxLength={160}
                            onChange={(e) => setShortDescription(e.target.value)}
                        />
                    </Card>
                </div>

                <div>
                    <ExampleListInput />
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit">
                        {mode === "edit" ? "Update Package Tier" : "Create Package Tier"}
                    </Button>
                </div>
            </Card>
        </form>
    )
}