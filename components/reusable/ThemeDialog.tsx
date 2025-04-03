"use client"
import React from "react"

import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
    DialogClose,
    DialogDescription,
} from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"


interface ThemeDialogProps {
    trigger?: React.ReactNode
    title: string
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}
export default function ThemeDialog({ trigger, title, children, open, onOpenChange }: ThemeDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="space-y-4 max-h-[80vh] overflow-y-auto no-scrollbar">
                <VisuallyHidden>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {title}
                    </DialogDescription>
                </VisuallyHidden>
                {children}
            </DialogContent>
        </Dialog>
    )
}
