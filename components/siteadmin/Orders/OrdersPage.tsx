"use client";
import React, { useState } from "react";
import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import OrderColumn from "./OrderColumn";
import OrderCard from "./OrderCard";

// Dummy data for orders (each order includes an id, customer name, items, and current phase)
const initialColumns = {
    received: [
        { id: "1", customer: "Alice", items: "Widget A, Widget B", phase: "received" },
        { id: "5", customer: "Eli", items: "Widget G, Widget H", phase: "received" },
    ],
    preparing: [{ id: "2", customer: "Bob", items: "Widget C", phase: "preparing" }],
    packing: [{ id: "3", customer: "Charlie", items: "Widget D, Widget E", phase: "packing" }],
    shipped: [{ id: "4", customer: "Dana", items: "Widget F", phase: "shipped" }],
    delivered: [],
};

const phases: Array<keyof typeof initialColumns> = [
    "received",
    "preparing",
    "packing",
    "shipped",
    "delivered",
];

export default function OrdersPage() {
    const [columns, setColumns] = useState(initialColumns);
    const [activeOrder, setActiveOrder] = useState(null);

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (!over) return;

        // Get container from active draggable
        const activeContainer = active.data.current?.containerId;

        // Try to get container from the drop target data;
        // if not present (e.g. empty column), fallback to over.id (the droppable container's id)
        let overContainer = over.data?.current?.containerId;
        if (!overContainer) {
            overContainer = over.id;
        }

        // If moving within the same column, reorder
        if (activeContainer === overContainer) {
            const orderList = columns[activeContainer as keyof typeof columns];
            const oldIndex = orderList.findIndex((item) => item.id === active.id);
            const newIndex = orderList.findIndex((item) => item.id === over.id);
            if (oldIndex !== -1 && newIndex !== -1) {
                setColumns({
                    ...columns,
                    [activeContainer]: arrayMove(orderList, oldIndex, newIndex),
                });
            }
        } else {
            // Moving from one column to another
            const activeList = [...columns[activeContainer as keyof typeof columns]];
            const overList = [...columns[overContainer as keyof typeof columns]];
            const activeIndex = activeList.findIndex((item) => item.id === active.id);
            const activeItem = activeList[activeIndex];

            activeList.splice(activeIndex, 1);
            overList.push({ ...activeItem, phase: overContainer });

            setColumns({
                ...columns,
                [activeContainer]: activeList,
                [overContainer]: overList,
            });
        }
        setActiveOrder(null);
    };

    return (
        <div className="flex w-full h-full gap-4 p-4 overflow-auto">
            <DndContext
                collisionDetection={closestCenter}
                onDragStart={({ active }) => {
                    const containerId = phases.find((phase) =>
                        columns[phase as keyof typeof columns].some(
                            (order) => order.id === active.id
                        )
                    );
                    setActiveOrder(
                        active.data.current ? { ...active.data.current.item, containerId } : null
                    );
                }}
                onDragEnd={handleDragEnd}
            >
                {phases.map((phase) => (
                    <div key={phase}>
                        <SortableContext
                            items={columns[phase as keyof typeof columns].map((order) => order.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <OrderColumn phase={phase} orders={columns[phase]} />
                        </SortableContext>
                    </div>
                ))}
                <DragOverlay>
                    {activeOrder ? <OrderCard order={activeOrder} dragOverlay /> : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}