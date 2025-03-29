"use client"

import React, { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import {
    getThemes,
    createTheme,
    updateTheme,
    deleteTheme,
    Theme,
} from "@/app/actions/siteadmin/themes"
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import ThemeCard from "@/components/reusable/ThemeCard"
import { Theme as EmojiPickerTheme } from "emoji-picker-react"
import { X } from "lucide-react"

// Dynamically load the emoji picker (avoids SSR issues)
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false })

interface ThemeDialogProps {
    trigger?: React.ReactNode
    title: string
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

function ThemeDialog({ trigger, title, children, open, onOpenChange }: ThemeDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="space-y-4 max-h-[80vh] overflow-y-auto no-scrollbar">
                <VisuallyHidden>
                    <DialogTitle>{title}</DialogTitle>
                </VisuallyHidden>
                {children}
            </DialogContent>
        </Dialog>
    )
}

export default function BookThemesPage() {
    const [themes, setThemes] = useState<Theme[]>([])

    // CREATE state
    const [newThemeName, setNewThemeName] = useState("")
    const [newEmojis, setNewEmojis] = useState<string[]>([])
    const [newColor, setNewColor] = useState("#ff0000") // default color

    // EDIT state
    const [editing, setEditing] = useState<Theme | null>(null)

    // DELETE state
    const [deletingId, setDeletingId] = useState<number | null>(null)

    useEffect(() => {
        getThemes().then(setThemes)
    }, [])

    // CREATE
    const handleCreate = async () => {
        if (!newThemeName.trim()) return
        const created = await createTheme(newThemeName.trim(), newEmojis, newColor)
        if (created) {
            setThemes((prev) => [...prev, created])
            setNewThemeName("")
            setNewEmojis([])
            setNewColor("#ff0000")
        }
    }

    const handleNewEmojiSelect = (emojiObject: any) => {
        if (newEmojis.length < 4) {
            setNewEmojis((prev) => [...prev, emojiObject.emoji])
        }
    }

    // EDIT
    const handleEditOpen = (theme: Theme) => {
        setEditing({
            ...theme,
            emoji_list: theme.emoji_list ?? [],
            background_color: theme.background_color ?? "#333333",
        })
    }

    // Remove a single emoji from the editing list
    const handleRemoveEditEmoji = (index: number) => {
        if (!editing) return
        const updatedList = [...editing.emoji_list!]
        updatedList.splice(index, 1)
        setEditing((prev) => prev && { ...prev, emoji_list: updatedList })
    }

    const handleEditEmojiSelect = (emojiObject: any) => {
        if (!editing) return
        if ((editing.emoji_list?.length ?? 0) < 4) {
            setEditing((prev) =>
                prev
                    ? { ...prev, emoji_list: [...prev.emoji_list!, emojiObject.emoji] }
                    : prev
            )
        }
    }

    const handleUpdate = async () => {
        if (!editing) return
        const updated = await updateTheme(
            editing.id,
            editing.theme_name.trim(),
            editing.emoji_list ?? [],
            editing.background_color ?? "#333333"
        )
        if (updated) {
            setThemes((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
            setEditing(null)
        }
    }

    // DELETE
    const handleDeleteConfirm = async () => {
        if (deletingId === null) return
        const success = await deleteTheme(deletingId)
        if (success) {
            setThemes((prev) => prev.filter((t) => t.id !== deletingId))
            setDeletingId(null)
        }
    }

    return (
        <Card className="w-full p-6 space-y-6">
            {/* CREATE DIALOG */}
            <Card className="p-4 flex flex-col md:flex-row items-center justify-between">
                <h2 className="text-lg font-semibold">Package Themes</h2>
                <ThemeDialog trigger={<Button>Add Theme</Button>} title="Create Theme">
                    <div className="w-full flex items-center justify-between mt-4">
                        <h2 className="text-lg font-semibold">Create New Theme</h2>
                        <DialogClose asChild>
                            <Button onClick={handleCreate} className="">
                                Create
                            </Button>
                        </DialogClose>
                    </div>

                    <div className="flex flex-col w-full">
                        <Label>Theme Name</Label>
                        <Input
                            value={newThemeName}
                            onChange={(e) => setNewThemeName(e.target.value)}
                            placeholder="e.g. Valentines"
                        />
                    </div>

                    <div className="w-full flex flex-row items-center justify-between">
                        <Label className="mt-4">Background Color</Label>
                        <input
                            type="color"
                            value={newColor}
                            onChange={(e) => setNewColor(e.target.value)}
                            className="h-10 w-16 cursor-pointer"
                        />
                    </div>

                    <div className="w-full flex flex-col items-center justify-center gap-y-2">
                        <Label>Add up to 4 emojis</Label>
                        <div className="flex gap-3 flex-wrap mt-2">
                            {newEmojis.map((emoji, idx) => (
                                <div key={idx} className="relative w-14 h-14 rounded-full flex items-center justify-center text-2xl bg-muted shadow-md">
                                    <span>{emoji}</span>
                                    <Button
                                        size="icon"
                                        className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-red-600 hover:bg-red-700 p-1 flex items-center justify-center text-xs text-white shadow-sm"
                                        onClick={() => {
                                            const updatedEmojis = [...newEmojis]
                                            updatedEmojis.splice(idx, 1)
                                            setNewEmojis(updatedEmojis)
                                        }}
                                    >
                                        <X />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <EmojiPicker theme={EmojiPickerTheme.DARK} onEmojiClick={handleNewEmojiSelect} />
                    </div>




                </ThemeDialog>
            </Card>

            {/* THEME LIST */}
            <div className="space-y-3">
                {themes.map((theme) => (
                    <ThemeCard
                        key={theme.id}
                        theme={theme}
                        onEdit={handleEditOpen}
                        onDelete={(id) => setDeletingId(id)}
                    />
                ))}
            </div>

            {/* EDIT DIALOG */}
            {editing && (
                <ThemeDialog
                    open={true}
                    onOpenChange={(open) => {
                        if (!open) setEditing(null)
                    }}
                    title="Edit Theme"
                >
                    <div className="w-full flex items-center justify-between mt-4">
                        <h2 className="text-lg font-semibold">Edit Theme</h2>
                        <DialogClose asChild>
                            <Button onClick={handleUpdate} className="">
                                Update
                            </Button>
                        </DialogClose>
                    </div>

                    <div className="flex flex-col w-full">
                        <Label>Theme Name</Label>
                        <Input
                            value={editing.theme_name}
                            onChange={(e) =>
                                setEditing((prev) => prev && { ...prev, theme_name: e.target.value })
                            }
                        />
                    </div>


                    <div className="w-full flex flex-row items-center justify-between">
                        <Label className="mt-4">Background Color</Label>
                        <input
                            type="color"
                            value={editing.background_color || ""}
                            onChange={(e) =>
                                setEditing((prev) =>
                                    prev ? { ...prev, background_color: e.target.value } : prev
                                )
                            }
                            className="h-10 w-16 cursor-pointer"
                        />
                    </div>

                    <div className="w-full flex flex-col items-center justify-center gap-y-2">
                        <Label className="mt-2">Edit Emojis (Click X to remove)</Label>
                        <div className="flex gap-3 flex-wrap mt-2">
                            {editing.emoji_list?.map((emoji, idx) => (
                                <div key={idx} className="relative w-14 h-14 rounded-full flex items-center justify-center text-2xl bg-muted shadow-md">
                                    <span>{emoji}</span>
                                    <Button
                                        size="icon"
                                        className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-red-600 hover:bg-red-700 p-1 flex items-center justify-center text-xs text-white shadow-sm"
                                        onClick={() => handleRemoveEditEmoji(idx)}
                                    >
                                        <X />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <EmojiPicker theme={EmojiPickerTheme.DARK} onEmojiClick={handleEditEmojiSelect} />
                    </div>



                </ThemeDialog>
            )}

            {/* DELETE DIALOG */}
            {deletingId !== null && (
                <ThemeDialog
                    open={true}
                    onOpenChange={(open) => {
                        if (!open) setDeletingId(null)
                    }}
                    title="Confirm Delete"
                >
                    <p className="text-center">Are you sure you want to delete this theme?</p>
                    <div className="flex justify-center gap-4 mt-4">
                        <DialogClose asChild>
                            <Button variant="destructive" onClick={handleDeleteConfirm}>
                                Confirm Delete
                            </Button>
                        </DialogClose>
                        <DialogClose asChild>
                            <Button variant="outline" onClick={() => setDeletingId(null)}>
                                Cancel
                            </Button>
                        </DialogClose>
                    </div>
                </ThemeDialog>
            )}
        </Card>
    )
}