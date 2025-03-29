"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import dynamic from "next/dynamic"
import { Theme as EmojiPickerTheme } from "emoji-picker-react"
import { X } from "lucide-react"

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false })

interface ThemeFormProps {
    mode: "create" | "edit"
    themeName: string
    setThemeName: (val: string) => void
    color: string
    setColor: (val: string) => void
    emojis: string[]
    addEmoji: (emoji: string) => void
    removeEmoji: (index: number) => void
    onSubmit: () => void
    submitLabel?: string
}

export default function ThemeForm({
    mode,
    themeName,
    setThemeName,
    color,
    setColor,
    emojis,
    addEmoji,
    removeEmoji,
    onSubmit,
    submitLabel,
}: ThemeFormProps) {
    const handleEmojiSelect = (emojiObject: any) => {
        addEmoji(emojiObject.emoji)
    }

    return (
        <div className="space-y-4 mr-4 mt-5">
            {/* Header row with form title & submit button */}
            <div className="w-full flex items-center justify-between">
                <h2 className="text-lg font-semibold capitalize">
                    {mode === "create" ? "Create New Theme" : "Edit Theme"}
                </h2>
                <Button onClick={onSubmit}>
                    {submitLabel ?? (mode === "create" ? "Create" : "Update")}
                </Button>
            </div>

            {/* Theme Name */}
            <div className="flex flex-col w-full">
                <Label>Theme Name</Label>
                <Input
                    value={themeName}
                    onChange={(e) => setThemeName(e.target.value)}
                    placeholder="e.g. Valentines"
                />
            </div>

            {/* Color Picker */}
            <div className="w-full flex flex-row items-center justify-between">
                <Label className="mt-4">Background Color</Label>
                <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-10 w-16 cursor-pointer"
                />
            </div>

            {/* Emojis */}
            <div className="w-full flex flex-col items-center justify-center gap-y-2">
                <Label>Add up to 4 emojis</Label>
                <div className="flex gap-3 flex-wrap mt-2">
                    {emojis.map((emoji, idx) => (
                        <div
                            key={idx}
                            className="relative w-14 h-14 rounded-full flex items-center justify-center text-2xl bg-muted shadow-md"
                        >
                            <span>{emoji}</span>
                            <Button
                                size="icon"
                                className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-red-600 hover:bg-red-700 p-1 flex items-center justify-center text-xs text-white shadow-sm"
                                onClick={() => removeEmoji(idx)}
                            >
                                <X />
                            </Button>
                        </div>
                    ))}
                </div>
                <EmojiPicker theme={EmojiPickerTheme.DARK} onEmojiClick={handleEmojiSelect} />
            </div>
        </div>
    )
}