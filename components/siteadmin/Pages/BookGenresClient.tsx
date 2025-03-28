"use client";

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

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
    const [genres, setGenres] = useState<string[]>([
        'Fantasy',
        'Sci-Fi',
        'Horror',
    ])
    const [newGenre, setNewGenre] = useState('')
    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const [editValue, setEditValue] = useState('')
    const [deleteIndex, setDeleteIndex] = useState<number | null>(null)

    const handleCreate = () => {
        if (!newGenre.trim()) return
        setGenres(prev => [...prev, newGenre.trim()])
        console.log('Genre Created:', newGenre)
        setNewGenre('')
    }

    const handleUpdate = () => {
        if (editingIndex === null || !editValue.trim()) return
        const updated = [...genres]
        updated[editingIndex] = editValue.trim()
        setGenres(updated)
        console.log('Genre Updated:', editValue)
        setEditingIndex(null)
        setEditValue('')
    }

    const handleDelete = () => {
        if (deleteIndex === null) return
        const deleted = genres[deleteIndex]
        const updated = genres.filter((_, i) => i !== deleteIndex)
        setGenres(updated)
        console.log('Genre Deleted:', deleted)
        setDeleteIndex(null)
    }

    return (
        <Card className="p-6 space-y-6">
            <Card className="p-4 flex flex-col md:flex-row items-center justify-between">
                <h2 className="text-lg font-semibold">Book Genres</h2>

                {/* Create Genre Dialog */}
                <GenreDialog trigger={<Button>Add Genre</Button>} title="Create Genre">
                    <Label htmlFor="newGenre">New Genre</Label>
                    <Input
                        id="newGenre"
                        value={newGenre}
                        onChange={e => setNewGenre(e.target.value)}
                        placeholder="e.g. Mystery"
                    />
                    <Button onClick={handleCreate}>Create</Button>
                </GenreDialog>
            </Card>

            {/* Genre List */}
            <ul className="space-y-3">
                {genres.map((genre, i) => (
                    <li
                        key={i}
                        className="flex items-center justify-between p-3 bg-muted rounded-md"
                    >
                        <span>{genre}</span>
                        <div className="flex gap-2">
                            {/* Edit Genre Dialog */}
                            <GenreDialog
                                trigger={
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setEditingIndex(i)
                                            setEditValue(genre)
                                        }}
                                    >
                                        Edit
                                    </Button>
                                }
                                title="Edit Genre"
                            >
                                <Label htmlFor={`edit-${i}`}>Edit Genre</Label>
                                <Input
                                    id={`edit-${i}`}
                                    value={editValue}
                                    onChange={e => setEditValue(e.target.value)}
                                />
                                <Button onClick={handleUpdate}>Update</Button>
                            </GenreDialog>

                            {/* Delete Genre Confirm Dialog */}
                            <GenreDialog
                                trigger={
                                    <Button
                                        variant="destructive"
                                        onClick={() => setDeleteIndex(i)}
                                    >
                                        Delete
                                    </Button>
                                }
                                title="Confirm Delete"
                            >
                                <p className='text-center'>Are you sure you want to delete "{genre}"?</p>
                                <div className="flex items-center justify-center gap-4">
                                    <DialogClose asChild>
                                        <Button variant="destructive" onClick={handleDelete}>
                                            Confirm Delete
                                        </Button>
                                    </DialogClose>
                                    <DialogClose asChild>
                                        <Button
                                            variant="outline"
                                            onClick={() => setDeleteIndex(null)}
                                        >
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