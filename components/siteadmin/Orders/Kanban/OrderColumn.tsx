"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import OrderCard from "./Kanban/OrderCard";
import { useDroppable } from "@dnd-kit/core";

interface Order {
    id: string;
    customer: string;
    items: string;
    phase: string;
}

interface OrderColumnProps {
    phase: string;
    orders: Order[];
    onMoreInfo?: (order: Order) => void;
}

export default function OrderColumn({ phase, orders, onMoreInfo }: OrderColumnProps) {
    // Use useDroppable to ensure the column acts as a drop target
    const { setNodeRef } = useDroppable({ id: phase });

    return (
        <div className="flex flex-col w-64 p-4 rounded-lg border shadow-sm bg-card">
            <h3 className="text-xl font-semibold mb-3 capitalize">{phase}</h3>
            <div ref={setNodeRef} className="flex flex-col space-y-3 min-h-[150px] p-2 border border-dashed rounded">
                {orders.length > 0 ? (
                    orders.map((order) => (
                        <OrderCard key={order.id} order={order} containerId={phase} onMoreInfo={onMoreInfo} />
                    ))
                ) : (
                    <div className="text-center text-sm text-muted-foreground py-8">
                        Drop orders here
                    </div>
                )}
            </div>
        </div>
    );
}