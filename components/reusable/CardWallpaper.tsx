"use client"
import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { generateRandomEmojiScatter } from "@/utils/data/functions"

// A unified interface for the data required by the card component.
export interface CategoryProps {
    id: number
    displayName: string
    emojiList: string[] | null
    backgroundColor: string | null
}

interface CardWallpaperProps {
    id: number
    displayName: string
    emojiList: string[] | null
    backgroundColor: string | null
    onEdit: (category: CategoryProps) => void
    onDelete: (id: number) => void
}

export default function CardWallpaper({
    id,
    displayName,
    emojiList,
    backgroundColor,
    onEdit,
    onDelete,
}: CardWallpaperProps) {
    const [scatter, setScatter] = useState<
        { emoji: string; top: number; left: number }[]
    >([])

    useEffect(() => {
        // Generate a grid-based scatter; adjust rows/cols as needed.
        setScatter(generateRandomEmojiScatter(emojiList ?? [], 7, 8))
    }, [emojiList])

    const bgColor = backgroundColor || "#333333"

    return (
        <Card
            className="relative w-full h-[120px] p-4 flex items-center justify-center rounded-lg text-white"
            style={{ overflow: "hidden", backgroundColor: bgColor }}
        >
            {/* Background Emoji Wallpaper */}
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

            {/* Foreground Content */}
            <div
                className="relative z-10 w-full h-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-6 rounded-xl shadow-md"
                style={{
                    backgroundColor: "rgba(0, 0, 0, 0.35)",
                    backdropFilter: "blur(2px)",
                    WebkitBackdropFilter: "blur(2px)",
                }}
            >
                <div className="text-white text-xl font-bold tracking-wide">
                    {displayName}
                </div>
                <div className="flex gap-3">
                    <Button
                        className="bg-amber-500 hover:bg-amber-600 hover:scale-105 text-white font-semibold px-4 py-2 rounded-md transition duration-300"
                        onClick={() =>
                            onEdit({
                                id,
                                displayName,
                                emojiList,
                                backgroundColor: bgColor,
                            })
                        }
                    >
                        Edit
                    </Button>
                    <Button
                        className="bg-red-700 hover:bg-red-800 hover:scale-105 text-white font-semibold px-4 py-2 rounded-md transition duration-300"
                        onClick={() => onDelete(id)}
                    >
                        Delete
                    </Button>
                </div>
            </div>
        </Card>
    )
}