"use client";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";

interface TrackingIdModalProps {
    isOpen: boolean;
    onClose: (trackingId?: string) => void; // if trackingId provided, consider it confirmed
}

export default function TrackingIdModal({ isOpen, onClose }: TrackingIdModalProps) {
    const [trackingId, setTrackingId] = useState("");

    const handleConfirm = () => {
        // Make sure tracking id is non-empty
        if (trackingId.trim()) {
            onClose(trackingId.trim());
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Enter Tracking ID</DialogTitle>
                </DialogHeader>
                <div className="p-4 flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Tracking ID"
                        value={trackingId}
                        onChange={(e) => setTrackingId(e.target.value)}
                        className="p-2 border rounded"
                    />
                    <div className="flex justify-end gap-2">
                        <button onClick={() => onClose()} className="px-4 py-2 border rounded">
                            Cancel
                        </button>
                        <button onClick={handleConfirm} className="px-4 py-2 border rounded bg-primary text-white">
                            Confirm
                        </button>
                    </div>
                </div>
                <DialogClose asChild>
                    <button className="hidden" />
                </DialogClose>
            </DialogContent>
        </Dialog>
    );
}