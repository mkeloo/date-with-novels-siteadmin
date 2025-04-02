import React, { useState } from "react";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverlay
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SortableListProps {
    items: string[];
    onDragEnd: (event: DragEndEvent) => void;
    onUpdate: (index: number, newValue: string) => void;
    onDelete: (index: number) => void;
}

interface SortableItemProps {
    id: string;
    item: string;
    index: number;
    isEditing: boolean;
    onStartEdit: (index: number) => void;
    onSaveEdit: (index: number, newValue: string) => void;
    onDelete: (index: number) => void;
}

function SortableItem({
    id,
    item,
    index,
    isEditing,
    onStartEdit,
    onSaveEdit,
    onDelete,
}: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id,
        animateLayoutChanges: () => false, // Disable default animations to add custom ones
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: isDragging ? "none" : "transform 200ms ease-in-out", // Smooth animation when moving
        opacity: isDragging ? 0.6 : 1, // Slight fade when dragging
        scale: isDragging ? 1.05 : 1, // Slight scale increase when dragging
    };

    const [editValue, setEditValue] = useState(item);

    return (
        <li
            ref={setNodeRef}
            style={style}
            {...attributes}
            className="flex items-center gap-2 bg-gray-100 dark:bg-neutral-800 p-3 rounded-md shadow-lg transition-all"
        >
            {/* Drag handle */}
            <span
                {...listeners}
                className="cursor-grab p-2 text-gray-500 hover:text-gray-800 dark:hover:text-white active:scale-110 transition-transform"
            >
                <GripVertical className="w-5 h-5" />
            </span>

            {/* Editable List Item */}
            <div className="flex-1">
                {isEditing ? (
                    <Input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") onSaveEdit(index, editValue);
                        }}
                        className="w-full"
                        autoFocus
                    />
                ) : (
                    <span>{item}</span>
                )}
            </div>

            {/* Edit & Delete Buttons */}
            <div className="flex gap-2">
                {isEditing ? (
                    <Button
                        disableLoader
                        size="icon"
                        variant="ghost"
                        onClick={() => onSaveEdit(index, editValue)}
                    >
                        <Check className="w-4 h-4 text-green-500" />
                    </Button>
                ) : (
                    <Button disableLoader size="icon" variant="ghost" onClick={() => onStartEdit(index)}>
                        <Pencil className="w-4 h-4" />
                    </Button>
                )}
                <Button disableLoader size="icon" variant="ghost" onClick={() => onDelete(index)}>
                    <X className="w-4 h-4 text-red-500" />
                </Button>
            </div>
        </li>
    );
}

export function SortableList({
    items,
    onDragEnd,
    onUpdate,
    onDelete,
}: SortableListProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        })
    );

    const itemIds = items.map((_, index) => index.toString());
    const [activeItem, setActiveItem] = useState<string | null>(null);
    const [editIndex, setEditIndex] = useState<number | null>(null);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={(event) => setActiveItem(event.active.id as string)}
            onDragEnd={(event) => {
                onDragEnd(event);
                setActiveItem(null);
            }}
        >
            <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                <ul style={{ minHeight: "100px" }} className="mt-4 space-y-2">
                    {items.map((item, index) => (
                        <SortableItem
                            key={index}
                            id={index.toString()}
                            item={item}
                            index={index}
                            isEditing={editIndex === index}
                            onStartEdit={setEditIndex}
                            onSaveEdit={(i, newValue) => {
                                onUpdate(i, newValue);
                                setEditIndex(null);
                            }}
                            onDelete={onDelete}
                        />
                    ))}
                </ul>
            </SortableContext>

            {/* Drag Overlay - For better animation */}
            <DragOverlay>
                {activeItem ? (
                    <div className="bg-gray-100 dark:bg-neutral-800 p-3 rounded-md shadow-xl scale-110 opacity-90 transition-transform flex items-center gap-2">
                        {/* Drag Handle */}
                        <span className="cursor-grab p-2 text-gray-500 hover:text-gray-800 dark:hover:text-white">
                            <GripVertical className="w-5 h-5" />
                        </span>

                        {/* Render the actual item content */}
                        <span className="flex-1">
                            {items[Number(activeItem)]}
                        </span>

                        {/* Edit & Delete Buttons (Optional, disabled in overlay for better UX) */}
                        <div className="flex gap-2">
                            <Button disableLoader size="icon" variant="ghost" disabled>
                                <Pencil className="w-4 h-4" />
                            </Button>
                            <Button disableLoader size="icon" variant="ghost" disabled>
                                <X className="w-4 h-4 text-red-500" />
                            </Button>
                        </div>
                    </div>
                ) : null}
            </DragOverlay>

        </DndContext>
    );
}