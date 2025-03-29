"use client"

import React, { useState, useEffect, Suspense } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { cn, slugify } from "@/lib/utils"
import type { ComponentType } from "react"

import { Card } from "@/components/ui/card"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select"

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
    "Romance",
    "Mystery",
    "Thriller",
    "Young Adult Fiction",
    "Fantasy",
    "Horror",
    "Surprise Me",
]

const ICON_OPTIONS = [
    "Book",
    "Gift",
    "Package",
    "Heart",
    "Smile",
    "Star",
    "Ghost",
    "Bookmark",
    "Moon",
    "Sun",
]

export default function PackageTierClient() {
    const [isEnabled, setIsEnabled] = useState(false)
    const [tierType, setTierType] = useState("")
    const [theme, setTheme] = useState("")
    const [title, setTitle] = useState("")
    const [slug, setSlug] = useState("")
    const [shortDescription, setShortDescription] = useState("")
    const [price, setPrice] = useState("")
    const [genres, setGenres] = useState<string[]>([])
    const [iconName, setIconName] = useState("Book")
    const [LucideIcon, setLucideIcon] = useState<React.ComponentType<any> | null>(null)


    useEffect(() => {
        setSlug(slugify(title + " " + (theme ? THEMES.find(t => t.value === theme)?.label : "")))
    }, [title, theme])


    useEffect(() => {
        const loadIcon = async () => {
            try {
                const mod = await import("lucide-react")
                const Icon = mod[iconName as keyof typeof mod]

                // Only set if it's a valid component
                if (typeof Icon === "function") {
                    setLucideIcon(() => Icon as ComponentType<any>)
                } else {
                    setLucideIcon(null)
                }
            } catch {
                setLucideIcon(null)
            }
        }

        if (iconName) loadIcon()
    }, [iconName])

    const toggleGenre = (genre: string) => {
        setGenres((prev) =>
            prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
        )
    }

    return (
        <Card className="w-full h-full p-6 gap-4 flex flex-col">
            {/* Package Tier Configuration */}

            <Card className="w-full flex flex-col lg:flex-row items-center justify-between p-4">
                <div className="w-full lg:w-1/2 flex items-center gap-4">
                    <h2 className="text-lg font-semibold">Package Tier Configuration</h2>
                </div>

            </Card>

            {/* Tier Type, Theme Type & Genres */}
            <div className="w-full flex flex-col lg:flex-row  gap-4">
                <Card className="w-full lg:w-1/2 flex flex-col p-4 ">
                    <div className="w-full flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Package Stuff</h2>
                        {/* Enabled Switch */}
                        <div className="h-full flex  justify-start items-center gap-4">
                            <Label className="mb-0">Enabled</Label>
                            <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
                        </div>
                    </div>

                    <div className="w-full ">
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
                    </div>

                    <div className="w-full">
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
                    </div>
                </Card>

                <Card className="w-full lg:w-1/2  p-4 ">
                    <h2 className="text-lg font-semibold">Genres</h2>
                    <div className="flex flex-wrap gap-3">
                        {GENRES.map((genre) => (
                            <button
                                type="button"
                                key={genre}
                                className={cn(
                                    "px-3 py-2 rounded-full border text-sm transition",
                                    genres.includes(genre)
                                        ? "bg-blue-600 text-white border-blue-700"
                                        : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                )}
                                onClick={() => toggleGenre(genre)}
                            >
                                {genre}
                            </button>
                        ))}
                    </div>

                    {/* <div>
                        <Label>Icon</Label>
                        <Select value={iconName} onValueChange={setIconName}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Icon" />
                            </SelectTrigger>
                            <SelectContent>
                                {ICON_OPTIONS.map((icon) => (
                                    <SelectItem key={icon} value={icon}>
                                        <div className="flex items-center gap-2">
                                            <Suspense fallback={<span>...</span>}>
                                                {
                                                    React.createElement(
                                                        require("lucide-react")[icon as keyof typeof import("lucide-react")],
                                                        { className: "w-4 h-4" }
                                                    )
                                                }
                                            </Suspense>
                                            <span>{icon}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div> */}


                    <div className="">
                        <Label className="flex items-center justify-between">
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
                                <Suspense fallback={<span className="text-xs">...</span>}>
                                    {
                                        (() => {
                                            const iconToRender = iconName?.trim() || "Book"
                                            const IconModule = require("lucide-react")
                                            const IconComponent = IconModule[iconToRender as keyof typeof IconModule] || IconModule["Book"]

                                            return React.createElement(IconComponent, {
                                                className: "w-5 h-5 text-foreground hover:scale-110 hover:text-blue-300 transition duration-300",
                                            })
                                        })()
                                    }
                                </Suspense>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Info */}
                <Card className="p-4">
                    <h2 className="text-lg font-semibold">Product Info</h2>

                    <div>
                        <Label>Title</Label>
                        <Input
                            placeholder="Enter product title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div>
                        <Label>Slug</Label>
                        <Input value={slug} readOnly className="opacity-60" />
                    </div>

                </Card>

                {/* Price & Icon */}
                <Card className="p-4">
                    <h2 className="text-lg font-semibold">Visuals & Pricing</h2>

                    <div>
                        <Label>Price ($)</Label>
                        <Input
                            type="number"
                            placeholder="Enter price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                    </div>

                    <div className="mb-4">
                        <Label>Short Description</Label>
                        <Input
                            placeholder="Max 160 characters"
                            maxLength={160}
                            value={shortDescription}
                            onChange={(e) => setShortDescription(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            {shortDescription.length}/160 characters
                        </p>
                    </div>


                </Card>


            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
                <Button type="submit">Save Package Tier</Button>
            </div>

        </Card>
    )
}