"use client"

import React, { useEffect, useState } from "react"
import {
    getThemes,
    createTheme,
    updateTheme,
    deleteTheme,
    Theme,
} from "@/app/actions/siteadmin/themes"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DialogClose } from "@/components/ui/dialog"
import CardWallpaper from "@/components/reusable/CardWallpaper"
import ThemeForm from "@/components/reusable/ThemeForm"
import ThemeDialog from "@/components/reusable/ThemeDialog"

export default function BookThemesPage() {
    const [themes, setThemes] = useState<Theme[]>([])

    // CREATE state
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [newThemeName, setNewThemeName] = useState("")
    const [newColor, setNewColor] = useState("#ff0000")
    const [newEmojis, setNewEmojis] = useState<string[]>([])

    // EDIT state
    const [editing, setEditing] = useState<Theme | null>(null)
    const [isEditOpen, setIsEditOpen] = useState(false)

    // DELETE state
    const [deletingId, setDeletingId] = useState<number | null>(null)

    useEffect(() => {
        getThemes().then(setThemes)
    }, [])

    // CREATE handler
    const handleCreateSubmit = async () => {
        if (!newThemeName.trim()) return
        const created = await createTheme(newThemeName.trim(), newEmojis, newColor)
        if (created) {
            setThemes((prev) => [...prev, created])
            setNewThemeName("")
            setNewColor("#ff0000")
            setNewEmojis([])
            setIsCreateOpen(false)
        }
    }

    const addNewEmoji = (emoji: string) => {
        if (newEmojis.length < 4) {
            setNewEmojis((prev) => [...prev, emoji])
        }
    }

    const removeNewEmoji = (idx: number) => {
        const updated = [...newEmojis]
        updated.splice(idx, 1)
        setNewEmojis(updated)
    }

    // EDIT handlers
    const handleEditOpen = (theme: Theme) => {
        setEditing({
            ...theme,
            emoji_list: theme.emoji_list ?? [],
            background_color: theme.background_color ?? "#333333",
        })
        setIsEditOpen(true)
    }

    const handleEditSubmit = async () => {
        if (!editing) return
        const updated = await updateTheme(
            editing.id,
            editing.theme_name.trim(),
            editing.emoji_list ?? [],
            editing.background_color ?? "#333333"
        )
        if (updated) {
            setThemes((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
            setIsEditOpen(false)
            setEditing(null)
        }
    }

    const addEditEmoji = (emoji: string) => {
        if (!editing) return
        if (editing.emoji_list!.length < 4) {
            setEditing((prev) =>
                prev ? { ...prev, emoji_list: [...prev.emoji_list!, emoji] } : prev
            )
        }
    }

    const removeEditEmoji = (idx: number) => {
        if (!editing) return
        const updated = [...editing.emoji_list!]
        updated.splice(idx, 1)
        setEditing((prev) => (prev ? { ...prev, emoji_list: updated } : prev))
    }

    // DELETE handler
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
            <Card className="p-4 flex flex-col md:flex-row items-center justify-between">
                <h2 className="text-lg font-semibold">Package Themes</h2>
                <Button onClick={() => setIsCreateOpen(true)}>Add Theme</Button>
            </Card>

            {/* CREATE DIALOG */}
            <ThemeDialog
                open={isCreateOpen}
                onOpenChange={(open) => setIsCreateOpen(open)}
                title="Create Theme"
            >
                <ThemeForm
                    mode="create"
                    themeName={newThemeName}
                    setThemeName={setNewThemeName}
                    color={newColor}
                    setColor={setNewColor}
                    emojis={newEmojis}
                    addEmoji={addNewEmoji}
                    removeEmoji={removeNewEmoji}
                    onSubmit={handleCreateSubmit}
                />
            </ThemeDialog>

            {/* THEME LIST */}
            <div className="space-y-3 px-4 h-full max-h-[540px] overflow-y-auto no-scrollbar">
                {themes.map((theme) => (
                    <CardWallpaper
                        key={theme.id}
                        id={theme.id}
                        displayName={theme.theme_name}
                        emojiList={theme.emoji_list}
                        backgroundColor={theme.background_color}
                        onEdit={() => handleEditOpen(theme)}
                        onDelete={(id) => setDeletingId(id)}
                    />
                ))}
            </div>

            {/* EDIT DIALOG */}
            <ThemeDialog
                open={isEditOpen}
                onOpenChange={(open) => {
                    setIsEditOpen(open)
                    if (!open) setEditing(null)
                }}
                title="Edit Theme"
            >
                {editing && (
                    <ThemeForm
                        mode="edit"
                        themeName={editing.theme_name}
                        setThemeName={(val) =>
                            setEditing((prev) => (prev ? { ...prev, theme_name: val } : prev))
                        }
                        color={editing.background_color || "#333333"}
                        setColor={(val) =>
                            setEditing((prev) => (prev ? { ...prev, background_color: val } : prev))
                        }
                        emojis={editing.emoji_list || []}
                        addEmoji={addEditEmoji}
                        removeEmoji={removeEditEmoji}
                        onSubmit={handleEditSubmit}
                    />
                )}
            </ThemeDialog>

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