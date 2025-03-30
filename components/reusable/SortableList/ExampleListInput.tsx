"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DragEndEvent } from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { SortableList } from "./SortableList"
import { Pencil } from "lucide-react"
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@/components/ui/tabs"

export default function ExampleListInput() {
    const [title, setTitle] = useState("My List")
    const [newItem, setNewItem] = useState("")
    const [items, setItems] = useState<string[]>([])
    const [editIndex, setEditIndex] = useState<number | null>(null)
    const [isEditingTitle, setIsEditingTitle] = useState(false)
    const [tab, setTab] = useState("formatted")

    const handleAddItem = () => {
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
            {/* List Input and Drag & Drop List */}
            <Card className="w-full lg:w-1/2 p-4 shadow-lg">
                <div className="flex justify-between items-center">
                    {isEditingTitle ? (
                        <Input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="text-lg font-bold border-none focus:ring-0"
                            placeholder="Enter list title"
                            onBlur={() => setIsEditingTitle(false)}
                            autoFocus
                        />
                    ) : (
                        <div className="flex justify-between items-center w-full">
                            <h2 className="text-lg font-bold">{title}</h2>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setIsEditingTitle(true)}
                            >
                                <Pencil className="w-5 h-5" />
                            </Button>
                        </div>
                    )}
                </div>
                <div>
                    <div className="flex gap-2">
                        <Input
                            type="text"
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            className="flex-1"
                            placeholder="Add an item..."
                        />
                        <Button onClick={handleAddItem}>
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
                </div>
            </Card>

            {/* Preview Panel with Tabs */}
            <Card className="w-full lg:w-1/2 p-4 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">List Preview</h2>
                </div>

                <Tabs value={tab} onValueChange={setTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-2">
                        <TabsTrigger value="formatted">Formatted View</TabsTrigger>
                        <TabsTrigger value="json">JSON Preview</TabsTrigger>
                    </TabsList>

                    <TabsContent value="formatted">
                        <div className="space-y-2 text-sm">
                            <h3 className="text-base font-semibold text-foreground">{title}</h3>
                            <ul className="list-disc ml-6 space-y-2">
                                {items.map((item, idx) => (
                                    <li key={idx} className="text-muted-foreground">{item}</li>
                                ))}
                            </ul>
                        </div>
                    </TabsContent>

                    <TabsContent value="json">
                        <pre className="bg-neutral-800 text-lime-300 p-4 rounded-md text-sm overflow-auto">
                            {JSON.stringify({ title, items }, null, 2)}
                        </pre>
                    </TabsContent>
                </Tabs>
            </Card>
        </div>
    )
}