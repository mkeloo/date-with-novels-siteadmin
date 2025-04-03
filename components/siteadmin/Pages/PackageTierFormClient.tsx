"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { cn, slugify } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import LucideIcon from "@/components/reusable/LucideIcon"
import { getPackagesById, Packages } from "@/app/actions/siteadmin/packages"
import { getPackageTiers, getSupportFlagsByPackageTierId } from "@/app/actions/siteadmin/package_tier"
import { getThemes } from "@/app/actions/siteadmin/themes"


const GENRES = [
    "Romance", "Mystery", "Thriller", "Young Adult Fiction", "Fantasy", "Horror", "Surprise Me"
]

type PackagesFormClientProps = {
    mode: "create" | "edit"
    packageId: string | null
}

type FieldChange = {
    before: any
    after: any
}

type DialogData = Packages & {
    changes?: Record<string, FieldChange>
}

export default function PackagesFormClient({ mode, packageId }: PackagesFormClientProps) {
    const [loading, setLoading] = useState(mode === "edit")
    const [isEnabled, setIsEnabled] = useState(false)
    const [packageTierId, setPackageTierId] = useState<number | null>(null);
    const [packageTiers, setPackageTiers] = useState<{ id: number; name: string }[]>([]);
    const [theme, setTheme] = useState<string>("");
    const [themes, setThemes] = useState<{
        id: number;
        theme_name: string;
        supports_themed: boolean;
        supports_regular: boolean;
    }[]>([]);
    const [title, setTitle] = useState("")
    const [slug, setSlug] = useState("")
    const [shortDescription, setShortDescription] = useState("")
    const [price, setPrice] = useState("")
    const [genres, setGenres] = useState<string[]>([])
    const [iconName, setIconName] = useState("Book")
    const [packageContents, setPackageContents] = useState<string[]>([])


    const [showDialog, setShowDialog] = useState(false)
    const [originalData, setOriginalData] = useState<Packages | null>(null)
    const [dialogData, setDialogData] = useState<DialogData | null>(null)

    const router = useRouter()



    useEffect(() => {
        async function updateSlug() {
            try {
                if (!theme) {
                    setSlug(slugify(title));
                    return;
                }

                const allThemes = await getThemes();
                const selectedTheme = allThemes.find((t) => t.id.toString() === theme);
                const themeLabel = selectedTheme?.theme_name;

                const newSlug =
                    title + (themeLabel && themeLabel.toLowerCase() !== "regular" ? ` ${themeLabel}` : "");

                setSlug(slugify(newSlug));
            } catch (error) {
                console.error("Failed to generate slug:", error);
            }
        }

        updateSlug();
    }, [title, theme]);


    useEffect(() => {
        async function fetchTiers() {
            try {
                const data = await getPackageTiers();
                // Map the fetched tiers to an array of { id, name }
                setPackageTiers(data.map((t) => ({ id: t.id, name: t.name })));
            } catch (error) {
                console.error("Failed to fetch package tiers:", error);
            }
        }
        fetchTiers();
    }, []);


    useEffect(() => {
        async function fetchPackages(id: number) {
            try {
                const data: Packages = await getPackagesById(id);
                setIsEnabled(data.is_enabled);
                setPackageTierId(data.package_tier);
                setTheme(data.theme_id?.toString() || "");
                setTitle(data.name);
                setShortDescription(data.short_description);
                setPrice(data.price.toString());
                setGenres(data.allowed_genres);
                setIconName(data.icon_name);
                setPackageContents(data.package_contents || []);
                setOriginalData(data);
            } catch (error) {
                console.error("Failed to fetch package tier:", error);
            } finally {
                setLoading(false);
            }
        }

        if (mode === "edit" && packageId) {
            fetchPackages(Number(packageId));
        } else {
            setLoading(false);
        }
    }, [mode, packageId]);


    useEffect(() => {
        async function fetchFilteredThemes() {
            if (!packageTierId) return;

            try {
                const supportFlags = await getSupportFlagsByPackageTierId(packageTierId);
                const allThemesRaw = await getThemes();

                // Filter based on new supports_themed/supports_regular flags on the theme itself
                const filteredThemes = allThemesRaw.filter((theme) => {
                    if (theme.supports_themed && supportFlags.supports_themed) return true;
                    if (theme.supports_regular && supportFlags.supports_regular) return true;
                    return false;
                });

                setThemes(filteredThemes);
                // console.log("Filtered themes based on package tier ID:", filteredThemes);
            } catch (error) {
                console.error("Failed to fetch filtered themes:", error);
            }
        }

        // console.log("Fetching filtered themes for package tier ID:", packageTierId);
        fetchFilteredThemes();
    }, [packageTierId]);



    const toggleGenre = (genre: string) => {
        setGenres((prev) =>
            prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const payload = {
            is_enabled: isEnabled,
            theme_id: theme ? parseInt(theme) : null,
            name: title,
            slug,
            short_description: shortDescription,
            price: parseFloat(price),
            allowed_genres: genres,
            icon_name: iconName,
            sort: 0,
            package_contents: packageContents,
            package_tier: packageTierId ?? 1,
        }

        try {
            if (mode === "edit" && packageId && originalData) {
                const { updatePackages } = await import("../../../app/actions/siteadmin/packages")
                await updatePackages(parseInt(packageId), payload)

                // Compute changes
                const changes = Object.entries(payload).reduce((acc, [key, value]) => {
                    const originalValue = (originalData as any)[key]
                    if (JSON.stringify(value) !== JSON.stringify(originalValue)) {
                        acc[key] = { before: originalValue, after: value }
                    }
                    return acc
                }, {} as Record<string, FieldChange>)

                setDialogData({ ...originalData, ...payload, changes })
            } else {
                const { createPackages } = await import("../../../app/actions/siteadmin/packages")
                const newTier = await createPackages(payload)

                setDialogData({
                    ...newTier, // Use response if it returns new data, else payload
                    updated_at: new Date().toISOString(), // current timestamp
                })
            }

            setShowDialog(true)
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
            <Card className="w-full h-full p-4 gap-4 flex flex-col">
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

                        <div className="w-full flex flex-col">
                            <Label>Package Tier</Label>
                            <Select
                                value={packageTierId?.toString() || ""}
                                onValueChange={(val) => setPackageTierId(parseInt(val))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Tier" />
                                </SelectTrigger>
                                <SelectContent>
                                    {packageTiers.map((tier) => (
                                        <SelectItem key={tier.id} value={tier.id.toString()}>
                                            {tier.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>


                        <div className="w-full flex flex-col">
                            <Label>Theme Type</Label>
                            <Select value={theme} onValueChange={setTheme}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Theme" />
                                </SelectTrigger>
                                <SelectContent>
                                    {themes.map((themeObj: { id: number; theme_name: string; supports_themed: boolean; supports_regular: boolean }) => (
                                        <SelectItem key={themeObj.id} value={themeObj.id.toString()}>
                                            {themeObj.theme_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
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
                                            ? "bg-primary text-background border-primary"
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
                        <div className="w-full flex flex-col">
                            <Label>Title</Label>
                            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>

                        <div className="w-full flex flex-col">
                            <Label>Slug</Label>
                            <Input value={slug} readOnly />
                        </div>

                    </Card>

                    <Card className="p-4">
                        <div className="w-full flex flex-col">
                            <Label>Price ($)</Label>
                            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
                        </div>

                        <div className="w-full flex flex-col">
                            <Label>Description</Label>
                            <Input
                                value={shortDescription}
                                maxLength={160}
                                onChange={(e) => setShortDescription(e.target.value)}
                            />
                        </div>
                    </Card>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                    <Button disableLoader type="submit">
                        {mode === "edit" ? "Update Package Tier" : "Create Package Tier"}
                    </Button>
                </div>
            </Card>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <VisuallyHidden.Root>
                    <DialogTitle>Confirmation</DialogTitle>
                </VisuallyHidden.Root>
                <DialogContent className="max-w-lg space-y-4">
                    {dialogData && (
                        <>
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">{dialogData.name}</h2>
                                <LucideIcon iconName={dialogData.icon_name} className="w-6 h-6 text-muted-foreground" />
                            </div>

                            <div className="text-sm space-y-2">
                                {mode === "edit" && dialogData.changes ? (
                                    <>
                                        <h3 className="font-semibold">Updated Fields:</h3>
                                        {Object.entries(dialogData.changes).map(([key, { before, after }]) => (
                                            <div key={key}>
                                                <p className="font-medium capitalize">{key.replace("_", " ")}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Before: <strong>{String(before)}</strong>
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    After: <strong>{String(after)}</strong>
                                                </p>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <>
                                        <p><strong>Slug:</strong> {dialogData.slug}</p>
                                        <p><strong>Enabled:</strong> {dialogData.is_enabled ? "Yes" : "No"}</p>
                                        <p><strong>Package Tier:</strong> {dialogData.package_tier}</p>
                                        <p><strong>Theme ID:</strong> {dialogData.theme_id ?? "None"}</p>
                                        <p><strong>Description:</strong> {dialogData.short_description}</p>
                                        <p><strong>Price:</strong> ${dialogData.price.toFixed(2)}</p>
                                        <p><strong>Genres:</strong> {dialogData.allowed_genres.join(", ")}</p>
                                        <p><strong>Package Contents:</strong></p>
                                        <ul className="list-disc pl-5">
                                            {dialogData.package_contents?.map((item, idx) => (
                                                <li key={idx}>{item}</li>
                                            ))}
                                        </ul>
                                    </>
                                )}

                                <p className="text-xs text-muted-foreground">
                                    Last Updated: {new Date(dialogData.updated_at).toLocaleString()}
                                </p>
                            </div>

                            <div className="flex justify-end">
                                <Button onClick={() => router.push("/dashboard/product-settings/package-tiers")}>
                                    Go Back to Overview
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </form>
    )
}