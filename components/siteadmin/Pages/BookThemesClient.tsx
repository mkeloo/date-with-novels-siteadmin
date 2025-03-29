"use client"

import React, { useEffect, useState } from "react"
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
import { generateRandomGradient } from "@/lib/functions"


interface ThemeDialogProps {
    trigger: React.ReactNode
    title: string
    children: React.ReactNode
}

function ThemeDialog({ trigger, title, children }: ThemeDialogProps) {
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

export default function BookThemesPage() {
    const [themes, setThemes] = useState<Theme[]>([])
    const [newTheme, setNewTheme] = useState("")
    const [editing, setEditing] = useState<{ id: number; name: string } | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    useEffect(() => {
        const fetchThemes = async () => {
            const result = await getThemes()
            if (result) setThemes(result)
        }

        fetchThemes()
    }, [])

    const handleCreate = async () => {
        if (!newTheme.trim()) return
        const created = await createTheme(newTheme.trim())
        if (created) {
            setThemes((prev) => [...prev, created])
            setNewTheme("")
        }
    }

    const handleUpdate = async () => {
        if (!editing?.name.trim()) return
        const updated = await updateTheme(editing.id, editing.name.trim())
        if (updated) {
            setThemes((prev) =>
                prev.map((g) => (g.id === editing.id ? { ...g, theme_name: editing.name } : g))
            )
            setEditing(null)
        }
    }

    const handleDelete = async () => {
        if (deletingId === null) return
        const success = await deleteTheme(deletingId)
        if (success) {
            setThemes((prev) => prev.filter((g) => g.id !== deletingId))
            setDeletingId(null)
        }
    }

    return (
        <Card className="w-full p-6 space-y-6">
            <Card className="p-4 flex flex-col md:flex-row items-center justify-between">
                <h2 className="text-lg font-semibold">Package Themes</h2>
                <ThemeDialog trigger={<Button>Add Theme</Button>} title="Create Theme">
                    <Label htmlFor="newTheme">New Theme</Label>
                    <Input
                        id="newTheme"
                        value={newTheme}
                        onChange={(e) => setNewTheme(e.target.value)}
                        placeholder="e.g. Horror"
                    />
                    <DialogClose asChild>
                        <Button onClick={handleCreate}>Create</Button>
                    </DialogClose>
                </ThemeDialog>
            </Card>

            <ul className="space-y-3">
                {themes.map((theme) => (
                    <li
                        key={theme.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-md"
                    >
                        <span>{theme.theme_name}</span>
                        <div className="flex gap-2">
                            <ThemeDialog
                                trigger={
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setEditing({ id: theme.id, name: theme.theme_name })
                                        }
                                    >
                                        Edit
                                    </Button>
                                }
                                title="Edit Theme"
                            >
                                <Label htmlFor={`edit-${theme.id}`}>Edit Theme</Label>
                                <Input
                                    id={`edit-${theme.id}`}
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
                            </ThemeDialog>

                            <ThemeDialog
                                trigger={
                                    <Button
                                        variant="destructive"
                                        onClick={() => setDeletingId(theme.id)}
                                    >
                                        Delete
                                    </Button>
                                }
                                title="Confirm Delete"
                            >
                                <p className="text-center">
                                    Are you sure you want to delete "{theme.theme_name}"?
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
                            </ThemeDialog>
                        </div>
                    </li>
                ))}
            </ul>
        </Card>
    )
}