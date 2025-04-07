import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Trash2, ImageIcon } from 'lucide-react'
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
    rectSortingStrategy,
} from '@dnd-kit/sortable'
import { DropzoneUploader } from '@/components/siteadmin/MediaBrowser/DropzoneUploader'
import { getPackagesById } from '@/app/actions/siteadmin/packages'
import { getPackageMediaFiles, uploadPackageMediaFiles, deletePackageMediaFile } from "@/app/actions/siteadmin/image_uploader"
import SortableImage from '../MediaBrowser/SortableImage'
import { DialogDescription } from '@radix-ui/react-dialog'


export interface ImageItem {
    id: string
    alt: string
    src: string
}



// PackageMediaForm.tsx
export default function PackageMediaForm({
    mode,
    packageId,
}: {
    mode: "create" | "edit";
    packageId: string | null;
}) {
    const [images, setImages] = useState<ImageItem[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [packageSlug, setPackageSlug] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [deleteMode, setDeleteMode] = useState(false);
    const [selectedForDelete, setSelectedForDelete] = useState<Set<string>>(new Set());
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const activeImage = images.find((img) => img.id === activeId);

    useEffect(() => {
        if (!packageId) return;

        const fetchSlug = async () => {
            try {
                const pkg = await getPackagesById(Number(packageId));
                setPackageSlug(`packages/${pkg.slug}`);
            } catch (err) {
                console.error("Failed to fetch package:", err);
            }
        };

        fetchSlug();
    }, [packageId]);

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
                    {mode === "create" ? "Upload Media for New Package" : "Manage Media for Package"}
                </h2>
                <div className="flex gap-2">
                    <Button
                        disableLoader
                        size="sm"
                        variant={"outline"}
                        onClick={() => {
                            setDeleteMode((prev) => !prev);
                            // Clear selections when toggling delete mode off.
                            if (deleteMode) setSelectedForDelete(new Set());
                        }}
                    >
                        {deleteMode ? '' : <Trash2 className="w-4 h-4 mr-1" />}
                        {deleteMode ? "Cancel Delete" : "Delete"}
                    </Button>
                    <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                        <DialogTrigger asChild>
                            <Button disableLoader size="sm" variant="default">
                                <Upload className="w-4 h-4 mr-1" /> Upload
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                            <DialogTitle>Upload Media</DialogTitle>
                            <VisuallyHidden.Root>
                                <DialogDescription>Upload Image</DialogDescription>
                            </VisuallyHidden.Root>
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

                                    // Close the dialog after upload
                                    setUploadOpen(false);
                                }}
                                maxFiles={10}
                                packageId={packageId ?? ""}
                                packageSlug={packageSlug ?? "loading..."}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card className="flex-1 border rounded-md p-4">
                {/* Confirm Delete Button */}
                {deleteMode && selectedForDelete.size > 0 && (
                    <Button
                        disableLoader
                        className="self-end"
                        variant="destructive"
                        onClick={() => setConfirmDialogOpen(true)}
                    >
                        <Trash2 className="w-4 h-4" />
                        Confirm Delete ({selectedForDelete.size})
                    </Button>
                )}
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
                            {Array.from({ length: 12 }).map((_, index) => (
                                <div key={index} className="h-36 bg-muted-foreground/30 animate-pulse rounded-xl" />
                            ))}
                        </div>
                    ) : (
                        <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {images.map((image) => (
                                    <SortableImage
                                        key={image.id}
                                        image={image}
                                        selectable={deleteMode}
                                        selected={selectedForDelete.has(image.id)}
                                        onToggleSelect={() => {
                                            setSelectedForDelete((prev) => {
                                                const updated = new Set(prev);
                                                updated.has(image.id) ? updated.delete(image.id) : updated.add(image.id);
                                                return updated;
                                            });
                                        }}
                                    />
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
                    <p className="text-muted-foreground text-sm text-center">No media uploaded yet.</p>
                )}
            </Card>


            {/* Confirm Delete Dialog */}
            <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <DialogContent className="max-w-sm">
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <VisuallyHidden.Root>
                        <DialogDescription>Delete Image</DialogDescription>
                    </VisuallyHidden.Root>
                    <p className="text-sm text-muted-foreground mb-4">
                        Are you sure you want to delete {selectedForDelete.size} image
                        {selectedForDelete.size > 1 ? "s" : ""}?
                    </p>
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setConfirmDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={async () => {
                                if (!packageId) return;
                                try {
                                    await Promise.all(
                                        Array.from(selectedForDelete).map((id) => deletePackageMediaFile(id))
                                    );
                                    const updated = await getPackageMediaFiles(Number(packageId));
                                    setImages(updated);
                                    setSelectedForDelete(new Set());
                                    setDeleteMode(false);
                                    setConfirmDialogOpen(false);
                                } catch (err) {
                                    console.error("Bulk delete failed:", err);
                                }
                            }}
                        >
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
}