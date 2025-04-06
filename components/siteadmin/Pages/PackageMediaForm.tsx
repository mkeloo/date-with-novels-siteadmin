import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { DropzoneUploader } from '@/components/siteadmin/MediaBrowser/DropzoneUploader'
import { getPackagesById } from '@/app/actions/siteadmin/packages'
import { getPackageMediaFiles, uploadPackageMediaFiles } from "@/app/actions/siteadmin/image_uploader"


interface ImageItem {
    id: string
    alt: string
    src: string
}

const dummyImages: ImageItem[] = [
    { id: '1', alt: 'Cover Image', src: '' },
    { id: '2', alt: 'Gallery 1', src: '' },
    { id: '3', alt: 'Gallery 2', src: '' },
    { id: '4', alt: 'Banner', src: '' },
    { id: '5', alt: 'Cover Image', src: '' },
    { id: '6', alt: 'Gallery 1', src: '' },
    { id: '7', alt: 'Gallery 2', src: '' },
    { id: '8', alt: 'Banner', src: '' },
]

function SortableImage({ image }: { image: ImageItem }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image.id });
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
            className={`p-2 flex flex-col gap-2 items-center justify-center relative group cursor-move ${isDragging ? 'opacity-50' : ''}`}
        >
            <GripVertical className="absolute left-2 top-2 w-4 h-4 text-muted-foreground" />
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
                                <img src={image.src} alt={image.alt} className="object-contain max-w-full max-h-full rounded" />
                            ) : (
                                <ImageIcon className="w-10 h-10 text-muted-foreground" />
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
                <Button disableLoader variant="destructive" size="icon" className="h-6 w-6">
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </Card>
    );
}


// PackageMediaForm.tsx
export default function PackageMediaForm({
    mode,
    packageId,
}: {
    mode: "create" | "edit"
    packageId: string | null
}) {
    const [images, setImages] = useState<ImageItem[]>(dummyImages)
    const [activeId, setActiveId] = useState<string | null>(null)
    const [uploadOpen, setUploadOpen] = useState(false)
    const [packageSlug, setPackageSlug] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true);



    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    )

    const activeImage = images.find((img) => img.id === activeId)

    useEffect(() => {
        if (!packageId) return

        const fetchSlug = async () => {
            try {
                const pkg = await getPackagesById(Number(packageId))
                setPackageSlug(`packages/${pkg.slug}`)
            } catch (err) {
                console.error("Failed to fetch package:", err)
            }
        }

        fetchSlug()
    }, [packageId])



    useEffect(() => {
        if (!packageId) return;

        const fetchMedia = async () => {
            try {
                const pkg = await getPackagesById(Number(packageId));
                setPackageSlug(`packages/${pkg.slug}`);
                const media = await getPackageMediaFiles(Number(packageId));
                setImages(media);
            } catch (err) {
                console.error("Failed to fetch media:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMedia();
    }, [packageId]);

    return (
        <Card className="w-full h-full min-h-[65vh] p-4 gap-4 flex flex-col">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">
                    {mode === 'create' ? 'Upload Media for New Package' : 'Manage Media for Package'}
                </h2>
                <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                    <DialogTrigger asChild>
                        <Button disableLoader size="sm" variant="default">
                            <Upload className="w-4 h-4 mr-1" /> Upload
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogTitle>Upload Media</DialogTitle>
                        <DropzoneUploader
                            onSubmit={async (formData) => {
                                if (packageSlug) {
                                    formData.append("package_slug", packageSlug);
                                } else {
                                    console.error("Package slug is null and cannot be appended to formData.");
                                    return;
                                }

                                await uploadPackageMediaFiles(formData);

                                // Immediately refetch updated images after upload
                                if (packageId) {
                                    setIsLoading(true);
                                    const media = await getPackageMediaFiles(Number(packageId));
                                    setImages(media);
                                    setIsLoading(false);
                                }

                                // Optional: Close the dialog automatically after upload
                                setUploadOpen(false);
                            }}
                            maxFiles={10}
                            packageId={packageId ?? ''}
                            packageSlug={packageSlug ?? 'loading...'}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="flex-1 border rounded-md p-4">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={({ active }) => setActiveId(active.id as string)}
                    onDragEnd={({ active, over }) => {
                        setActiveId(null);
                        if (active.id !== over?.id) {
                            const oldIndex = images.findIndex((i) => i.id === active.id);
                            const newIndex = images.findIndex((i) => i.id === over?.id);
                            setImages(arrayMove(images, oldIndex, newIndex));
                        }
                    }}
                >
                    {isLoading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {Array.from({ length: 8 }).map((_, index) => (
                                <div key={index} className="h-32 bg-gray-300 animate-pulse rounded" />
                            ))}
                        </div>
                    ) : (
                        <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {images.map((image) => (
                                    <SortableImage key={image.id} image={image} />
                                ))}
                            </div>
                        </SortableContext>
                    )}
                    <DragOverlay>
                        {activeImage && (
                            <Card className="p-4 border-2 border-dashed border-muted bg-muted text-muted-foreground flex flex-col gap-2 items-center justify-center">
                                {activeImage.src ? (
                                    <img src={activeImage.src} alt={activeImage.alt} className="w-full h-32 object-cover rounded" />
                                ) : (
                                    <ImageIcon className="w-8 h-8" />
                                )}
                                <p className="text-xs">{activeImage.alt}</p>
                            </Card>
                        )}
                    </DragOverlay>
                </DndContext>
                {!isLoading && images.length === 0 && (
                    <p className="text-muted-foreground text-sm text-center">
                        No media uploaded yet.
                    </p>
                )}
            </Card>
        </Card>
    )
}