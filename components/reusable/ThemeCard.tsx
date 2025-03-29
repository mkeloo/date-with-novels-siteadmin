"use client"
import React, { useEffect, useState } from "react"
import {
    Theme
} from "@/app/actions/siteadmin/themes"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { generateRandomEmojiScatter } from "@/lib/functions"

export default function ThemeCard({
    theme,
    onEdit,
    onDelete,
}: {
    theme: Theme
    onEdit: (theme: Theme) => void
    onDelete: (id: number) => void
}) {
    const [scatter, setScatter] = useState<{ emoji: string; top: number; left: number }[]>([])

    useEffect(() => {
        // Generate a stable scatter once on mount or when emojis change
        setScatter(generateRandomEmojiScatter(theme.emoji_list ?? [], 7, 8))
    }, [theme.emoji_list])

    // If no color is set, fallback to a default
    const bgColor = theme.background_color || "#333333"

    return (
        <Card
            className="relative w-full h-full p-4 flex items-center justify-center rounded-lg text-white"
            style={{
                overflow: "hidden",
                backgroundColor: bgColor,
            }}
        >
            {/* The repeating emoji wallpaper (behind the content) */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {scatter.map((item, i) => (
                    <div
                        key={i}
                        className="absolute text-3xl opacity-70"
                        style={{
                            top: `${item.top}%`,
                            left: `${item.left}%`,
                            transform: "translate(-100%, -40%)",
                        }}
                    >
                        {item.emoji}
                    </div>
                ))}
            </div>

            <div
                className="relative z-10 w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-6 rounded-xl shadow-md"
                style={{
                    backgroundColor: "rgba(0, 0, 0, 0.35)",
                    backdropFilter: "blur(2px)",
                    WebkitBackdropFilter: "blur(2px)",
                }}
            >
                <div className="text-white text-xl font-bold tracking-wide">{theme.theme_name}</div>

                <div className="flex gap-3">
                    <Button
                        className="bg-amber-500 hover:bg-amber-600 hover:scale-105 text-white font-semibold px-4 py-2 rounded-md transition duration-300"
                        onClick={() => onEdit(theme)}
                    >
                        Edit
                    </Button>
                    <Button
                        className="bg-red-700 hover:bg-red-800 hover:scale-105 text-white font-semibold px-4 py-2 rounded-md transition duration-300"
                        onClick={() => onDelete(theme.id)}
                    >
                        Delete
                    </Button>
                </div>
            </div>
        </Card>
    )
}