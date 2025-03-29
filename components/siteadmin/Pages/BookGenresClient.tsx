"use client"

import React, { useEffect, useState } from "react"
import {
    getGenres,
    createGenre,
    updateGenre,
    deleteGenre,
    Genre,
} from "@/app/actions/siteadmin/genres"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DialogClose } from "@/components/ui/dialog"
import CardWallpaper from "@/components/reusable/CardWallpaper"
import GenreDialog from "@/components/reusable/GenreDialog"
import GenreForm from "@/components/reusable/GenreForm"

export default function BookGenresPage() {
    const [genres, setGenres] = useState<Genre[]>([])

    // CREATE state
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [newGenreName, setNewGenreName] = useState("")
    const [newColor, setNewColor] = useState("#ff0000")
    const [newEmojis, setNewEmojis] = useState<string[]>([])

    // EDIT state
    const [editing, setEditing] = useState<Genre | null>(null)
    const [isEditOpen, setIsEditOpen] = useState(false)

    // DELETE state
    const [deletingId, setDeletingId] = useState<number | null>(null)

    useEffect(() => {
        getGenres().then(setGenres)
    }, [])

    // CREATE handler
    const handleCreateSubmit = async () => {
        if (!newGenreName.trim()) return
        const created = await createGenre(newGenreName.trim(), newEmojis, newColor)
        if (created) {
            setGenres((prev) => [...prev, created])
            setNewGenreName("")
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
    const handleEditOpen = (genre: Genre) => {
        setEditing({
            ...genre,
            emoji_list: genre.emoji_list ?? [],
            background_color: genre.background_color ?? "#333333",
        })
        setIsEditOpen(true)
    }
    const handleEditSubmit = async () => {
        if (!editing) return
        const updated = await updateGenre(
            editing.id,
            editing.genre_name.trim(),
            editing.emoji_list ?? [],
            editing.background_color ?? "#333333"
        )
        if (updated) {
            setGenres((prev) =>
                prev.map((g) => (g.id === updated.id ? updated : g))
            )
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
        const success = await deleteGenre(deletingId)
        if (success) {
            setGenres((prev) => prev.filter((g) => g.id !== deletingId))
            setDeletingId(null)
        }
    }

    return (
        <Card className="w-full h-full p-6 space-y-6">
            <Card className="p-4 flex flex-col md:flex-row items-center justify-between">
                <h2 className="text-lg font-semibold">Book Genres</h2>
                <Button onClick={() => setIsCreateOpen(true)}>Add Genre</Button>
            </Card>

            {/* CREATE DIALOG */}
            <GenreDialog
                open={isCreateOpen}
                onOpenChange={(open) => setIsCreateOpen(open)}
                title="Create Genre"
            >
                <GenreForm
                    mode="create"
                    genreName={newGenreName}
                    setGenreName={setNewGenreName}
                    color={newColor}
                    setColor={setNewColor}
                    emojis={newEmojis}
                    addEmoji={addNewEmoji}
                    removeEmoji={removeNewEmoji}
                    onSubmit={handleCreateSubmit}
                />
            </GenreDialog>

            {/* GENRE LIST */}
            <div className="space-y-3 px-4 h-full max-h-[540px] overflow-y-auto no-scrollbar">
                {genres.map((genre) => (
                    <CardWallpaper
                        key={genre.id}
                        id={genre.id}
                        displayName={genre.genre_name}
                        emojiList={genre.emoji_list}
                        backgroundColor={genre.background_color}
                        onEdit={() => handleEditOpen(genre)}
                        onDelete={(id) => setDeletingId(id)}
                    />
                ))}
            </div>

            {/* EDIT DIALOG */}
            <GenreDialog
                open={isEditOpen}
                onOpenChange={(open) => {
                    setIsEditOpen(open)
                    if (!open) setEditing(null)
                }}
                title="Edit Genre"
            >
                {editing && (
                    <GenreForm
                        mode="edit"
                        genreName={editing.genre_name}
                        setGenreName={(val) =>
                            setEditing((prev) => (prev ? { ...prev, genre_name: val } : prev))
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
            </GenreDialog>

            {/* DELETE DIALOG */}
            {deletingId !== null && (
                <GenreDialog
                    open={true}
                    onOpenChange={(open) => {
                        if (!open) setDeletingId(null)
                    }}
                    title="Confirm Delete"
                >
                    <p className="text-center">
                        Are you sure you want to delete this genre?
                    </p>
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
                </GenreDialog>
            )}
        </Card>
    )
}