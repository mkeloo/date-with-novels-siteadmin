"use client"

import React, { useEffect, useState } from "react"
import {
    getGenres,
    createGenre,
    updateGenre,
    deleteGenre,
    Genre,
} from "@/app/actions/siteadmin/genres"
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


interface GenreDialogProps {
    trigger: React.ReactNode
    title: string
    children: React.ReactNode
}

function GenreDialog({ trigger, title, children }: GenreDialogProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="space-y-4">
                <VisuallyHidden>
                    <DialogTitle>{title}</DialogTitle>
                </VisuallyHidden>
                {children}
            </DialogContent>
        </Dialog>
    )
}

export default function BookGenresPage() {
    const [genres, setGenres] = useState<Genre[]>([])
    const [newGenre, setNewGenre] = useState("")
    const [editing, setEditing] = useState<{ id: number; name: string } | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    useEffect(() => {
        const fetchGenres = async () => {
            const result = await getGenres()
            if (result) setGenres(result)
        }

        fetchGenres()
    }, [])

    const handleCreate = async () => {
        if (!newGenre.trim()) return
        const created = await createGenre(newGenre.trim())
        if (created) {
            setGenres((prev) => [...prev, created])
            setNewGenre("")
        }
    }

    const handleUpdate = async () => {
        if (!editing?.name.trim()) return
        const updated = await updateGenre(editing.id, editing.name.trim())
        if (updated) {
            setGenres((prev) =>
                prev.map((g) => (g.id === editing.id ? { ...g, genre_name: editing.name } : g))
            )
            setEditing(null)
        }
    }

    const handleDelete = async () => {
        if (deletingId === null) return
        const success = await deleteGenre(deletingId)
        if (success) {
            setGenres((prev) => prev.filter((g) => g.id !== deletingId))
            setDeletingId(null)
        }
    }

    return (
        <Card className="p-6 space-y-6">
            <Card className="p-4 flex flex-col md:flex-row items-center justify-between">
                <h2 className="text-lg font-semibold">Book Genres</h2>
                <GenreDialog trigger={<Button>Add Genre</Button>} title="Create Genre">
                    <Label htmlFor="newGenre">New Genre</Label>
                    <Input
                        id="newGenre"
                        value={newGenre}
                        onChange={(e) => setNewGenre(e.target.value)}
                        placeholder="e.g. Mystery"
                    />
                    <DialogClose asChild>
                        <Button onClick={handleCreate}>Create</Button>
                    </DialogClose>
                </GenreDialog>
            </Card>

            <ul className="space-y-3">
                {genres.map((genre) => (
                    <li
                        key={genre.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-md"
                    >
                        <span>{genre.genre_name}</span>
                        <div className="flex gap-2">
                            <GenreDialog
                                trigger={
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setEditing({ id: genre.id, name: genre.genre_name })
                                        }
                                    >
                                        Edit
                                    </Button>
                                }
                                title="Edit Genre"
                            >
                                <Label htmlFor={`edit-${genre.id}`}>Edit Genre</Label>
                                <Input
                                    id={`edit-${genre.id}`}
                                    value={editing?.name || ""}
                                    onChange={(e) =>
                                        setEditing((prev) =>
                                            prev ? { ...prev, name: e.target.value } : prev
                                        )
                                    }
                                />
                                <DialogClose asChild>
                                    <Button onClick={handleUpdate}>Update</Button>
                                </DialogClose>
                            </GenreDialog>

                            <GenreDialog
                                trigger={
                                    <Button
                                        variant="destructive"
                                        onClick={() => setDeletingId(genre.id)}
                                    >
                                        Delete
                                    </Button>
                                }
                                title="Confirm Delete"
                            >
                                <p className="text-center">
                                    Are you sure you want to delete "{genre.genre_name}"?
                                </p>
                                <div className="flex justify-center gap-4">
                                    <DialogClose asChild>
                                        <Button variant="destructive" onClick={handleDelete}>
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
                        </div>
                    </li>
                ))}
            </ul>
        </Card>
    )
}