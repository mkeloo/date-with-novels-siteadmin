"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import OrderCard from "./OrderCard";

interface Order {
    id: string;
    customer: string;
    items: string;
    phase: string;
}

interface OrderColumnProps {
    phase: string;
    orders: Order[];
}

export default function OrderColumn({ phase, orders }: OrderColumnProps) {
    return (
        <div className="flex flex-col w-64 p-2 bg-gray-100 rounded">
            <h3 className="text-lg font-bold mb-2 capitalize">{phase}</h3>
            <div className="flex flex-col gap-2">
                {orders.map((order) => (
                    <OrderCard key={order.id} order={order} containerId={phase} />
                ))}
            </div>
        </div>
    );
}