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
import MoreInfoModal from "./MoreInfoDialog";
import TrackingIdModal from "./TrackingIdModal";

// Dummy data for orders
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

    // State for More Info modal
    const [infoOrder, setInfoOrder] = useState(null);
    const [showInfoModal, setShowInfoModal] = useState(false);

    // State for Tracking ID modal
    const [trackingOrder, setTrackingOrder] = useState<{ id: string;[key: string]: any } | null>(null);
    const [showTrackingModal, setShowTrackingModal] = useState(false);

    // Callback for More Info
    const handleMoreInfo = (order: any) => {
        console.log("More info for order", order);
        setInfoOrder(order);
        setShowInfoModal(true);
    };

    // Helper to update order's phase after tracking is provided (unchanged)
    const handleTrackingConfirm = (trackingId?: string) => {
        if (trackingOrder && trackingId) {
            const activeContainer = "packing";
            const overContainer = "shipped";
            const activeList = [...columns[activeContainer]];
            const activeIndex = activeList.findIndex(item => item.id === trackingOrder.id);
            const activeItem = activeList[activeIndex];

            const updatedOrder = { ...activeItem, phase: overContainer, tracking_id: trackingId };

            activeList.splice(activeIndex, 1);
            const overList = [...columns[overContainer], updatedOrder];

            setColumns({
                ...columns,
                [activeContainer]: activeList,
                [overContainer]: overList,
            });
        }
        setTrackingOrder(null);
        setShowTrackingModal(false);
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (!over) return;

        const activeContainer = active.data.current?.containerId;
        let overContainer = over.data?.current?.containerId;
        if (!overContainer) {
            overContainer = over.id;
        }

        if (activeContainer === "packing" && overContainer === "shipped") {
            const orderList = columns["packing"];
            const activeIndex = orderList.findIndex((item) => item.id === active.id);
            if (activeIndex !== -1) {
                const activeItem = orderList[activeIndex];
                setTrackingOrder(activeItem);
                setShowTrackingModal(true);
            }
            setActiveOrder(null);
            return;
        }

        if (activeContainer === overContainer) {
            const orderList = columns[activeContainer as keyof typeof columns];
            const oldIndex = orderList.findIndex(item => item.id === active.id);
            const newIndex = orderList.findIndex(item => item.id === over.id);
            if (oldIndex !== -1 && newIndex !== -1) {
                setColumns({
                    ...columns,
                    [activeContainer]: arrayMove(orderList, oldIndex, newIndex),
                });
            }
        } else {
            const activeList = [...columns[activeContainer as keyof typeof columns]];
            const overList = [...columns[overContainer as keyof typeof columns]];
            const activeIndex = activeList.findIndex(item => item.id === active.id);
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
        <>
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
                                <OrderColumn phase={phase} orders={columns[phase]} onMoreInfo={handleMoreInfo} />
                            </SortableContext>
                        </div>
                    ))}
                    <DragOverlay>
                        {activeOrder ? <OrderCard order={activeOrder} dragOverlay /> : null}
                    </DragOverlay>
                </DndContext>
            </div>

            {/* More Info Modal */}
            <MoreInfoModal
                isOpen={showInfoModal}
                order={infoOrder}
                onClose={() => setShowInfoModal(false)}
            />

            {/* Tracking ID Modal */}
            <TrackingIdModal
                isOpen={showTrackingModal}
                onClose={handleTrackingConfirm}
            />
        </>
    );
}