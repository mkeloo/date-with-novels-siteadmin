import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Upload, Eye, Trash2, ImageIcon, GripVertical } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
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

interface ImageItem {
    id: string
    alt: string
    src: string
    label: string
}

const dummyImages: ImageItem[] = [
    { id: '1', alt: 'Cover Image', src: '', label: 'cover' },
    { id: '2', alt: 'Gallery 1', src: '', label: 'gallery-1' },
    { id: '3', alt: 'Gallery 2', src: '', label: 'gallery-2' },
    { id: '4', alt: 'Banner', src: '', label: 'banner' },
    { id: '5', alt: 'Cover Image', src: '', label: 'cover' },
    { id: '6', alt: 'Gallery 1', src: '', label: 'gallery-1' },
    { id: '7', alt: 'Gallery 2', src: '', label: 'gallery-2' },
    { id: '8', alt: 'Banner', src: '', label: 'banner' },
]

function SortableImage({ image }: { image: ImageItem }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: image.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
    }

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`p-4 flex flex-col gap-2 items-center justify-center relative group cursor-move ${isDragging ? 'opacity-50' : ''}`}
        >
            <GripVertical className="absolute left-2 top-2 w-4 h-4 text-muted-foreground" />
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
            <p className="text-xs text-center line-clamp-2">{image.alt}</p>
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Eye className="w-4 h-4" />
                        </Button>
                    </DialogTrigger>
                    <VisuallyHidden.Root>
                        <DialogTitle>Preview Image</DialogTitle>
                    </VisuallyHidden.Root>
                    <DialogContent className="max-w-sm">
                        <p className="text-sm mb-2 font-semibold">{image.alt}</p>
                        <div className="w-full aspect-video bg-gray-100 flex items-center justify-center">
                            <ImageIcon className="w-10 h-10 text-muted-foreground" />
                        </div>
                    </DialogContent>
                </Dialog>
                <Button variant="destructive" size="icon" className="h-6 w-6">
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </Card>
    )
}

export default function PackageMediaForm({
    mode,
    packageId,
}: {
    mode: "create" | "edit"
    packageId: string | null
}) {
    const [images, setImages] = useState<ImageItem[]>(dummyImages)
    const [activeId, setActiveId] = useState<string | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    )

    const activeImage = images.find((img) => img.id === activeId)

    return (
        <Card className="w-full h-full p-4 gap-4 flex flex-col">
            <div className="flex justify-between items-center">
                <h2 className="text-sm font-semibold">
                    {mode === 'create' ? 'Upload Media for New Package' : 'Manage Media for Package'}
                </h2>
                <Button size="sm" variant="outline">
                    <Upload className="w-4 h-4 mr-1" /> Upload
                </Button>
            </div>

            <Card className="flex-1 border rounded-md p-4">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={({ active }) => setActiveId(active.id as string)}
                    onDragEnd={({ active, over }) => {
                        setActiveId(null)
                        if (active.id !== over?.id) {
                            const oldIndex = images.findIndex((i) => i.id === active.id)
                            const newIndex = images.findIndex((i) => i.id === over?.id)
                            setImages(arrayMove(images, oldIndex, newIndex))
                        }
                    }}
                >
                    <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {images.map((image) => (
                                <SortableImage key={image.id} image={image} />
                            ))}
                        </div>
                    </SortableContext>

                    <DragOverlay>
                        {activeImage ? (
                            <Card className="p-4 border-2 border-dashed border-muted bg-muted text-muted-foreground flex flex-col gap-2 items-center justify-center">
                                <ImageIcon className="w-8 h-8" />
                                <p className="text-xs">{activeImage.alt}</p>
                            </Card>
                        ) : null}
                    </DragOverlay>
                </DndContext>

                {images.length === 0 && (
                    <p className="text-muted-foreground text-sm col-span-full text-center">
                        No media uploaded yet.
                    </p>
                )}
            </Card>
        </Card>
    )
}