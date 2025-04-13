"use client";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";

interface Order {
    id: string;
    customer: string;
    items: string;
    phase: string;
}

interface MoreInfoModalProps {
    isOpen: boolean;
    order: Order | null;
    onClose: () => void;
}

export default function MoreInfoModal({ isOpen, order, onClose }: MoreInfoModalProps) {
    if (!order) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Order Details</DialogTitle>
                </DialogHeader>
                <div className="p-4">
                    <p><strong>Customer:</strong> {order.customer}</p>
                    <p><strong>Items:</strong> {order.items}</p>
                    <p><strong>Current Phase:</strong> {order.phase}</p>
                </div>
                <DialogClose asChild>
                    <button className="mt-4 px-4 py-2 rounded border">Close</button>
                </DialogClose>
            </DialogContent>
        </Dialog>
    );
}