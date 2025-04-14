// components/siteadmin/Orders/TrackingIdDialog.tsx
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { DialogDescription } from "@radix-ui/react-dialog";

interface TrackingIdDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (trackingId: string) => void;
}

export default function TrackingIdDialog({
    open,
    onClose,
    onConfirm,
}: TrackingIdDialogProps) {
    const [trackingId, setTrackingId] = useState("");

    const handleConfirm = () => {
        if (trackingId.trim()) {
            onConfirm(trackingId.trim());
            setTrackingId("");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Enter Tracking ID</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        If you are changing the status to "Shipped," please enter the tracking ID for the order.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <Input
                        placeholder="e.g., TRACK-123-XYZ"
                        value={trackingId}
                        onChange={(e) => setTrackingId(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                        <Button disableLoader variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button disableLoader onClick={handleConfirm} disabled={!trackingId.trim()}>
                            Confirm
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}