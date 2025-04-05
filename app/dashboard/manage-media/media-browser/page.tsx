"use client"
import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Folder, FolderOpen, ImageIcon, Eye, Trash2, Upload, ArrowLeft, FolderTree, GripVertical } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import { motion, AnimatePresence } from 'framer-motion'

import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    useSortable,
    rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const folders = [
    { id: '1', name: 'packages', slug: 'packages', parent_id: null },
    { id: '2', name: 'romantic-escape', slug: 'packages/romantic-escape', parent_id: '1' },
    { id: '3', name: 'gallery', slug: 'packages/romantic-escape/gallery', parent_id: '2' },
    { id: '4', name: 'dark-fantasy', slug: 'packages/dark-fantasy', parent_id: '1' },
    { id: '5', name: 'themes', slug: 'themes', parent_id: null },
    { id: '6', name: 'cozy-romance', slug: 'themes/cozy-romance', parent_id: '5' },
    { id: '7', name: 'gallery', slug: 'themes/cozy-romance/gallery', parent_id: '6' },
    { id: '8', name: 'mystery-thriller', slug: 'packages/mystery-thriller', parent_id: '1' },
]

const uploads = [
    { id: 'u1', file_path: 'packages/romantic-escape/cover.jpg', alt_text: 'Cover for Romantic Escape' },
    { id: 'u2', file_path: 'packages/romantic-escape/gallery/gallery-1.jpg', alt_text: 'Gallery Image 1' },
    { id: 'u3', file_path: 'packages/romantic-escape/gallery/gallery-2.jpg', alt_text: 'Gallery Image 2' },
    { id: 'u4', file_path: 'packages/romantic-escape/gallery/gallery-3.jpg', alt_text: 'Gallery Image 3' },
    { id: 'u5', file_path: 'packages/dark-fantasy/cover.jpg', alt_text: 'Cover for Dark Fantasy' },
    { id: 'u6', file_path: 'packages/dark-fantasy/banner.jpg', alt_text: 'Banner Image' },
    { id: 'u7', file_path: 'packages/dark-fantasy/gallery/gallery-1.jpg', alt_text: 'Gallery 1' },
    { id: 'u8', file_path: 'packages/mystery-thriller/cover.jpg', alt_text: 'Mystery Thriller Cover' },
    { id: 'u9', file_path: 'themes/cozy-romance/cover.jpg', alt_text: 'Cozy Romance Theme Cover' },
    { id: 'u10', file_path: 'themes/cozy-romance/gallery/gallery-1.jpg', alt_text: 'Cozy Romance Gallery 1' },
    { id: 'u11', file_path: 'themes/cozy-romance/gallery/gallery-2.jpg', alt_text: 'Cozy Romance Gallery 2' },
    { id: 'u12', file_path: 'packages/romantic-escape/banner.jpg', alt_text: 'Romantic Escape Banner' },
    { id: 'u13', file_path: 'packages/mystery-thriller/gallery-1.jpg', alt_text: 'Mystery Gallery Image' },
    { id: 'u14', file_path: 'packages/mystery-thriller/gallery/gallery-2.jpg', alt_text: 'Mystery Gallery 2' },
    { id: 'u15', file_path: 'packages/romantic-escape/gallery/gallery-4.jpg', alt_text: 'Gallery Image 4' },
]

// Sortable card for each file
function SortableUpload({ file }: { file: { id: string; file_path: string; alt_text: string } }) {
    const { active, isDragging, attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: file.id })

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
    }

    // Only hide the item being dragged (show it via DragOverlay)
    if (active?.id === file.id) {
        style.opacity = 0;
    }


    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="p-4 flex flex-col gap-2 items-center justify-center relative group"
        >
            <GripVertical className="absolute left-2 top-2 w-4 h-4 text-muted-foreground" />
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
            <p className="text-xs text-center line-clamp-2">{file.alt_text}</p>
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button disableLoader variant="ghost" size="icon" className="h-6 w-6">
                            <Eye className="w-4 h-4" />
                        </Button>
                    </DialogTrigger>
                    <VisuallyHidden.Root>
                        <DialogTitle>Preview Image</DialogTitle>
                    </VisuallyHidden.Root>
                    <DialogContent className="max-w-sm">
                        <p className="text-sm mb-2 font-semibold">{file.alt_text}</p>
                        <div className="w-full aspect-video bg-gray-100 flex items-center justify-center">
                            <ImageIcon className="w-10 h-10 text-muted-foreground" />
                        </div>
                    </DialogContent>
                </Dialog>
                <Button disableLoader variant="destructive" size="icon" className="h-6 w-6">
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </Card>
    )
}

export default function MediaBrowserPage() {
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
    const [previousFolder, setPreviousFolder] = useState<string | null>(null)
    const [uploadsState, setUploadsState] = useState(uploads)
    const [activeUploadId, setActiveUploadId] = useState<string | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    )

    const handleFolderClick = (slug: string) => {
        setPreviousFolder(selectedFolder)
        setSelectedFolder(slug)
    }

    const selectedFolderObj = folders.find(f => f.slug === selectedFolder)
    const childFolders = folders.filter(
        f => f.parent_id === selectedFolderObj?.id || (!selectedFolder && f.parent_id === null)
    )

    // Only show uploads that start with the selected folder path
    const visibleUploads =
        uploadsState.filter(file => selectedFolder && file.file_path.startsWith(selectedFolder)) || []

    // For the folder breadcrumb
    const getPathTrail = () => {
        const trail = []
        let current = selectedFolderObj
        while (current) {
            trail.unshift(current.name)
            current = folders.find(f => f.id === current?.parent_id)
        }
        return trail
    }

    // For the folder slide animation
    const direction = (() => {
        const prevIndex = folders.findIndex(f => f.slug === previousFolder)
        const currIndex = folders.findIndex(f => f.slug === selectedFolder)
        return currIndex > prevIndex ? 'left' : 'right'
    })()

    // Used for the drag overlay
    const activeUpload = visibleUploads.find(file => file.id === activeUploadId)

    return (
        <div className="flex w-full h-full min-h-[85vh] gap-4 p-4">
            <div className="w-1/4 border rounded-md p-4 flex flex-col justify-between overflow-hidden">
                <div>
                    <h2 className="text-sm font-semibold mb-4">Folders</h2>

                    {!selectedFolderObj && (
                        <div className="w-full mb-2 text-left text-sm px-2 py-2 rounded-md bg-muted text-muted-foreground font-medium flex">
                            <FolderTree className="w-5 h-5 mr-2" />
                            Root Directory
                        </div>
                    )}

                    {selectedFolderObj && (
                        <div
                            className="w-full mb-2 text-left text-sm px-2 py-2 rounded-md bg-muted text-muted-foreground font-medium cursor-pointer flex"
                            onClick={() => {
                                const parent = folders.find(f => f.id === selectedFolderObj.parent_id)
                                setPreviousFolder(selectedFolder)
                                setSelectedFolder(parent?.slug || null)
                            }}
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back to {folders.find(f => f.id === selectedFolderObj.parent_id)?.name || 'Root'}
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedFolder}
                            initial={{ x: direction === 'left' ? 40 : -40, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: direction === 'left' ? -40 : 40, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {childFolders.map(folder => {
                                const isActive = selectedFolder === folder.slug
                                const Icon = isActive ? FolderOpen : Folder
                                return (
                                    <Button
                                        disableLoader
                                        key={folder.id}
                                        variant={isActive ? 'default' : 'ghost'}
                                        className="w-full justify-start text-left mb-1"
                                        onClick={() => handleFolderClick(folder.slug)}
                                    >
                                        <Icon className="w-4 h-4 mr-2" />
                                        {folder.name}
                                    </Button>
                                )
                            })}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Folder trail */}
                <div className="mt-4 border-t pt-3 text-xs text-muted-foreground">
                    <span className="font-semibold block mb-1">Current Path</span>
                    <div className="text-xs text-muted-foreground">/{getPathTrail().join(' / ')}</div>
                </div>
            </div>

            <Separator orientation="vertical" className="h-full" />

            <ScrollArea className="flex-1 border rounded-md p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-sm font-semibold">
                        Files in: {selectedFolder ?? 'Select a folder'}
                    </h2>
                    <Button disableLoader size="sm" variant="outline">
                        <Upload className="w-4 h-4 mr-1" /> Upload
                    </Button>
                </div>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={({ active }) => setActiveUploadId(active.id as string)}
                    onDragEnd={({ active, over }) => {
                        setActiveUploadId(null)
                        if (active.id !== over?.id) {
                            const oldIndex = visibleUploads.findIndex(item => item.id === active.id)
                            const newIndex = visibleUploads.findIndex(item => item.id === over?.id)
                            const newVisibleUploads = arrayMove(visibleUploads, oldIndex, newIndex)
                            // Update uploadsState while keeping uploads outside the current folder intact
                            setUploadsState(prevUploads => {
                                const otherUploads = prevUploads.filter(
                                    file => !(selectedFolder && file.file_path.startsWith(selectedFolder))
                                )
                                return [...otherUploads, ...newVisibleUploads]
                            })
                        }
                    }}
                >
                    <SortableContext
                        items={visibleUploads.map(item => item.id)}
                        strategy={rectSortingStrategy}
                    >
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {visibleUploads.map(file => (
                                <SortableUpload key={file.id} file={file} />
                            ))}
                        </div>
                    </SortableContext>

                    <DragOverlay>
                        {activeUpload ? (
                            <Card className="p-4 border-2 border-dashed border-muted bg-muted text-muted-foreground flex flex-col gap-2 items-center justify-center">
                                <ImageIcon className="w-8 h-8" />
                                <p className="text-xs">{activeUpload.alt_text}</p>
                            </Card>
                        ) : null}
                    </DragOverlay>
                </DndContext>

                {visibleUploads.length === 0 && (
                    <p className="text-muted-foreground text-sm col-span-full text-center">
                        No files found in this folder.
                    </p>
                )}
            </ScrollArea>
        </div>
    )
}