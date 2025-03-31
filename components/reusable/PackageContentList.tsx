"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DragEndEvent } from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { SortableList } from "./SortableList/SortableList"
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@/components/ui/tabs"

type PackageContentListProps = {
    initialItems: string[]
    onChange: (items: string[]) => void
}

export default function PackageContentList({ initialItems, onChange }: PackageContentListProps) {
    const [newItem, setNewItem] = useState("")
    const [items, setItems] = useState<string[]>(initialItems || [])
    const [editIndex, setEditIndex] = useState<number | null>(null)
    const [tab, setTab] = useState("formatted")

    useEffect(() => {
        onChange(items)
    }, [items, onChange])

    const handleAddOrUpdateItem = () => {
        if (newItem.trim() === "") return

        if (editIndex !== null) {
            const updatedItems = [...items]
            updatedItems[editIndex] = newItem
            setItems(updatedItems)
            setEditIndex(null)
        } else {
            setItems([...items, newItem])
        }
        setNewItem("")
    }

    const handleDeleteItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index))
        if (editIndex === index) {
            setEditIndex(null)
            setNewItem("")
        }
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const oldIndex = Number(active.id)
        const newIndex = Number(over.id)
        setItems((items) => arrayMove(items, oldIndex, newIndex))
    }

    return (
        <div className="w-full h-full flex flex-col lg:flex-row gap-4 justify-center">
            {/* List Input & Sortable */}
            <Card className="w-full lg:w-1/2 p-4 shadow-lg">
                <h2 className="text-lg font-bold">Package Contents</h2>
                <div className="flex gap-2">
                    <Input
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        placeholder="Add a new package content item..."
                    />
                    <Button onClick={handleAddOrUpdateItem}>
                        {editIndex !== null ? "Update" : "Add"}
                    </Button>
                </div>

                <SortableList
                    items={items}
                    onDragEnd={handleDragEnd}
                    onUpdate={(index, newValue) => {
                        const updatedItems = [...items]
                        updatedItems[index] = newValue
                        setItems(updatedItems)
                    }}
                    onDelete={handleDeleteItem}
                />
            </Card>

            {/* Preview Panel */}
            <Card className="w-full lg:w-1/2 p-4 shadow-lg space-y-4">
                <h2 className="text-lg font-bold">Package Contents Preview</h2>

                <Tabs value={tab} onValueChange={setTab}>
                    <TabsList className="grid w-full grid-cols-2 mb-2">
                        <TabsTrigger value="formatted">Formatted View</TabsTrigger>
                        <TabsTrigger value="json">JSON Preview</TabsTrigger>
                    </TabsList>

                    <TabsContent value="formatted">
                        <ul className="list-disc ml-6 space-y-2 text-sm text-muted-foreground">
                            {items.map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ul>
                    </TabsContent>

                    <TabsContent value="json">
                        <pre className="bg-neutral-800 text-lime-300 p-4 rounded-md text-sm overflow-auto">
                            {JSON.stringify(items, null, 2)}
                        </pre>
                    </TabsContent>
                </Tabs>
            </Card>
        </div>
    )
}