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
    orderedAt?: string; // ISO string of when the order was placed
    // Optionally, tracking_id or other fields...
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

    // Default values for background and badge styling
    let priorityBadge = null;
    let cardBgClass = "";

    if (order.phase === "received" && order.orderedAt) {
        const orderedDate = new Date(order.orderedAt);
        const elapsedMs = Date.now() - orderedDate.getTime();
        const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);
        const elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60));
        // Display elapsed in hours if less than one day, otherwise in days.
        const elapsedDisplay = elapsedDays < 1 ? `${elapsedHours} hours ago` : `${Math.floor(elapsedDays)} days ago`;

        // Determine priority level:
        let priorityText = "";
        let badgeClass = "";
        if (elapsedDays < 1) {
            priorityText = "Low Priority";
            badgeClass = "badge-low"; // e.g. defined to use a green background
            cardBgClass = "order-bg-low"; // defined in your CSS (greenish)
        } else if (elapsedDays < 2) {
            priorityText = "Medium Priority";
            badgeClass = "badge-medium"; // e.g. yellow background
            cardBgClass = "order-bg-medium"; // defined in your CSS (yellowish)
        } else {
            priorityText = "High Priority";
            badgeClass = "badge-high"; // e.g. red background
            cardBgClass = "order-bg-high"; // defined in your CSS (reddish)
        }
        priorityBadge = (
            <div className="flex flex-col gap-1 mt-1">
                <span className={`inline-block text-xs font-semibold px-2 py-1 rounded ${badgeClass}`}>
                    {priorityText}
                </span>
                <span className="text-xxs text-muted-foreground">
                    {elapsedDisplay}
                </span>
            </div>
        );
    }

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
            className={`p-4 shadow hover:shadow-lg transition-shadow duration-200 flex flex-col gap-2 ${cardBgClass}`}
        >
            <h4 className="text-lg font-bold">{order.customer}</h4>
            <p className="text-sm">{order.items}</p>
            <p className="text-xs opacity-75">Order ID: {order.id}</p>
            {priorityBadge}
            {onMoreInfo && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
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