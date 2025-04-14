"use client";

import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Orders } from "@/app/actions/siteadmin/orders";

type Props = {
    open: boolean;
    order: Orders | null;
    onClose: () => void;
};

export default function OrderViewDialog({ open, order, onClose }: Props) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Order Details</DialogTitle>
                    <VisuallyHidden.Root>
                        <DialogDescription>Order Details</DialogDescription>
                    </VisuallyHidden.Root>
                </DialogHeader>
                {order ? (
                    <div className="space-y-2 text-sm">
                        <div><strong>ID:</strong> {order.id}</div>
                        <div><strong>User:</strong> {order.user_id}</div>
                        <div><strong>Package:</strong> {order.package_id}</div>
                        <div><strong>Transaction:</strong> {order.transaction_id ?? "—"}</div>
                        <div><strong>Status:</strong> {order.status}</div>
                        <div><strong>Tracking ID:</strong> {order.tracking_id ?? "—"}</div>
                        <div><strong>Ordered At:</strong> {new Date(order.ordered_at).toLocaleString()}</div>
                        <div><strong>Updated At:</strong> {new Date(order.updated_at).toLocaleString()}</div>
                    </div>
                ) : (
                    <p className="text-muted-foreground">No data available.</p>
                )}
            </DialogContent>
        </Dialog>
    );
}