import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, ImageIcon, GripVertical, Check } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import {
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ImageItem } from '../Pages/PackageMediaForm'



export default function SortableImage({
    image,
    selectable = false,
    selected = false,
    onToggleSelect,
}: {
    image: ImageItem;
    selectable?: boolean;
    selected?: boolean;
    onToggleSelect?: () => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: image.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
    };

    return (
        <Card
            ref={setNodeRef}
            style={{ ...style, minHeight: 160 }}
            {...attributes}
            {...listeners}
            className={`p-2 flex flex-col gap-2 items-center justify-center relative group cursor-move ${isDragging ? 'opacity-50' : ''
                }`}
        >
            <GripVertical className="absolute left-2 top-2 w-4 h-4 text-muted-foreground" />

            {selectable && (
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleSelect && onToggleSelect();
                    }}
                    className={`absolute inset-0 z-10 flex items-center justify-center rounded-xl ${selected ? 'bg-red-600/55 border-2 border-dashed border-white' : 'bg-black/40'
                        }`}
                >
                    {selected && <Check className="w-12 h-12 p-1 z-[40] text-white bg-black rounded-full" />}
                </div>
            )}

            {image.src ? (
                <img src={image.src} alt={image.alt} className="w-full h-32 object-cover rounded" />
            ) : (
                <div className="w-full h-32 bg-gray-200 flex items-center justify-center rounded">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                </div>
            )}
            <p className="text-xs text-center line-clamp-2">{image.alt}</p>
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button disableLoader variant="default" size="icon" className="h-6 w-6">
                            <Eye className="w-4 h-4" />
                        </Button>
                    </DialogTrigger>
                    <VisuallyHidden.Root>
                        <DialogTitle>Preview Image</DialogTitle>
                    </VisuallyHidden.Root>
                    <DialogContent className="max-w-sm">
                        <p className="text-sm mb-2 font-semibold">{image.alt}</p>
                        <div className="w-full aspect-video bg-muted-foreground flex items-center justify-center">
                            {image.src ? (
                                <img
                                    src={image.src}
                                    alt={image.alt}
                                    className="object-contain max-w-full max-h-full rounded"
                                />
                            ) : (
                                <ImageIcon className="w-10 h-10 text-muted-foreground" />
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </Card>
    );
}