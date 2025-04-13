"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Order {
    id: string;
    customer: string;
    items: string;
    phase: string;
}

interface OrderCardProps {
    order: Order;
    containerId?: string;
    dragOverlay?: boolean;
    onMoreInfo?: (order: Order) => void;
}

export default function OrderCard({ order, containerId, dragOverlay, onMoreInfo }: OrderCardProps) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: order.id,
        data: { containerId, item: order },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: dragOverlay ? 0.8 : 1,
        cursor: "grab",
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="p-4 shadow hover:shadow-lg transition-shadow duration-200 flex flex-col gap-2"
        >
            <h4 className="text-lg font-bold">{order.customer}</h4>
            <p className="text-sm">{order.items}</p>
            <p className="text-xs opacity-75">Order ID: {order.id}</p>
            {onMoreInfo && (
                <button
                    onClick={(e) => {
                        onMoreInfo(order);
                    }}
                    className="mt-2 text-sm underline hover:text-primary transition-colors"
                >
                    More Info
                </button>
            )}
        </Card>
    );
}