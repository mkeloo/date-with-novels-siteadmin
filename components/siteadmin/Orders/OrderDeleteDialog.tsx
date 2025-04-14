"use client";

import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
    open: boolean;
    orderId: number | null;
    onClose: () => void;
    onConfirm: () => void;
};

export default function OrderDeleteDialog({ open, orderId, onClose, onConfirm }: Props) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Delete</DialogTitle>
                    <VisuallyHidden.Root>
                        <DialogDescription>Delete Order</DialogDescription>
                    </VisuallyHidden.Root>
                </DialogHeader>
                <p>Are you sure you want to delete order ID <strong>{orderId}</strong>?</p>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button variant="destructive" onClick={onConfirm}>Delete</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}