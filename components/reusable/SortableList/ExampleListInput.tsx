"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { SortableList } from "./SortableList";
import { Pencil } from "lucide-react";

export default function ExampleListInput() {
    const [title, setTitle] = useState("My List");
    const [newItem, setNewItem] = useState("");
    const [items, setItems] = useState<string[]>([]);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [isEditingTitle, setIsEditingTitle] = useState(false); // Toggle title edit mode

    const handleAddItem = () => {
        if (newItem.trim() === "") return;
        if (editIndex !== null) {
            const updatedItems = [...items];
            updatedItems[editIndex] = newItem;
            setItems(updatedItems);
            setEditIndex(null);
        } else {
            setItems([...items, newItem]);
        }
        setNewItem("");
    };


    const handleDeleteItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
        if (editIndex === index) {
            setEditIndex(null);
            setNewItem("");
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        // Convert the item's id (a string) to a number for ordering.
        const oldIndex = Number(active.id);
        const newIndex = Number(over.id);
        setItems((items) => arrayMove(items, oldIndex, newIndex));
    };

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
                            onBlur={() => setIsEditingTitle(false)} // Exit edit mode on blur
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

                    {/* Use the extracted SortableList component */}
                    <SortableList
                        items={items}
                        onDragEnd={handleDragEnd}
                        onUpdate={(index, newValue) => {
                            const updatedItems = [...items];
                            updatedItems[index] = newValue;
                            setItems(updatedItems);
                        }}
                        onDelete={handleDeleteItem}
                    />
                </div>
            </Card>

            {/* JSON Preview */}
            <Card className="w-full lg:w-1/2 p-4 shadow-lg">
                <div>
                    <h2 className="text-lg font-bold">List JSON Preview</h2>
                </div>
                <div>
                    <pre className="bg-neutral-800 text-lime-300 p-4 rounded-md text-sm overflow-auto">
                        {JSON.stringify({ title, items }, null, 2)}
                    </pre>
                </div>
            </Card>
        </div>
    );
}