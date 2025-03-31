"use client";
import React, { useState } from 'react'
import { Toggle } from '@/components/ui/toggle';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Heading1, Heading2, Heading3, Heading4, Heading5, Code, Bold, Italic, Strikethrough, AlignCenter, AlignRight, AlignLeft, Highlighter, Image, List, ListOrdered, Minus, CornerDownLeft } from 'lucide-react';

interface ToolbarProps {
    editor: any; // Replace 'any' with the appropriate type if known
}

export default function Toolbar({ editor }: ToolbarProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState("");

    if (!editor) return null;

    const addImage = () => {
        if (imageUrl) {
            editor.chain().focus().setImage({ src: imageUrl }).run();
            setImageUrl(""); // Reset input after adding image
            setIsDialogOpen(false); // Close dialog
        }
    };

    //  add </br> to the editor
    const addLineBreak = () => {
        editor.chain().focus().insertContent('<br>').run();
    };

    const Options = [
        {
            icon: <Heading1 size={18} strokeWidth={3} />,
            onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
            pressed: editor.isActive('heading', { level: 1 }),
        },
        {
            icon: <Heading2 size={18} strokeWidth={3} />,
            onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
            pressed: editor.isActive("heading", { level: 2 }),
        },
        {
            icon: <Heading3 size={18} strokeWidth={3} />,
            onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
            pressed: editor.isActive("heading", { level: 3 }),
        },
        {
            icon: <Heading4 size={18} strokeWidth={3} />,
            onClick: () => editor.chain().focus().toggleHeading({ level: 4 }).run(),
            pressed: editor.isActive("heading", { level: 4 }),
        },
        {
            icon: <Heading5 size={18} strokeWidth={3} />,
            onClick: () => editor.chain().focus().toggleHeading({ level: 5 }).run(),
            pressed: editor.isActive("heading", { level: 5 }),
        },
        {
            icon: <Bold size={18} strokeWidth={3} />,
            onClick: () => editor.chain().focus().toggleBold().run(),
            pressed: editor.isActive("bold"),
        },
        {
            icon: <Italic size={18} strokeWidth={3} />,
            onClick: () => editor.chain().focus().toggleItalic().run(),
            pressed: editor.isActive("italic"),
        },
        {
            icon: <Strikethrough size={18} strokeWidth={3} />,
            onClick: () => editor.chain().focus().toggleStrike().run(),
            pressed: editor.isActive("strike"),
        },
        {
            icon: <AlignLeft size={18} strokeWidth={3} />,
            onClick: () => editor.chain().focus().setTextAlign("left").run(),
            pressed: editor.isActive({ textAlign: "left" }),
        },
        {
            icon: <AlignCenter size={18} strokeWidth={3} />,
            onClick: () => editor.chain().focus().setTextAlign("center").run(),
            pressed: editor.isActive({ textAlign: "center" }),
        },
        {
            icon: <AlignRight size={18} strokeWidth={3} />,
            onClick: () => editor.chain().focus().setTextAlign("right").run(),
            pressed: editor.isActive({ textAlign: "right" }),
        },
        {
            icon: <List size={18} strokeWidth={3} />,
            onClick: () => editor.chain().focus().toggleBulletList().run(),
            pressed: editor.isActive("bulletList"),
        },
        {
            icon: <ListOrdered size={18} strokeWidth={3} />,
            onClick: () => editor.chain().focus().toggleOrderedList().run(),
            pressed: editor.isActive("orderedList"),
        },
        {
            icon: <Code size={18} strokeWidth={3} />,
            onClick: () => editor.chain().focus().toggleCodeBlock().run(),
            pressed: editor.isActive("code"),
        },
        {
            icon: <Highlighter size={18} strokeWidth={3} />,
            onClick: () => editor.chain().focus().toggleHighlight().run(),
            pressed: editor.isActive("highlight"),
        },
        {
            icon: <Image size={18} strokeWidth={3} />,
            onClick: () => setIsDialogOpen(true), // Open the image dialog
            pressed: editor.isActive("image"),
        },
        {
            icon: <Minus size={18} strokeWidth={3} />,
            onClick: () => editor.chain().focus().setHorizontalRule().run(),
            pressed: editor.isActive("horizontalRule"),
        },
        {
            icon: <CornerDownLeft size={18} strokeWidth={3} />,
            onClick: addLineBreak,
            pressed: false,
        },

    ];

    return (
        <div className='border rounded-md p-1.5 mb-1 space-x-1 sticky top-10 z-50'>
            {
                Options.map((option, index) => (
                    <Toggle key={index} size="sm" pressed={option.pressed} onPressedChange={option.onClick}>
                        {option.icon}
                    </Toggle>
                ))
            }

            <Toggle size="sm" onPressedChange={() => editor.chain().focus().unsetAllMarks().run()}>
                <div className='text-xs'>Clear Formatting</div>
            </Toggle>

            {/* Image Upload Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add an Image</DialogTitle>
                    </DialogHeader>
                    <Input
                        type="url"
                        placeholder="Enter image URL..."
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                    />
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={addImage} disabled={!imageUrl}>Insert</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
