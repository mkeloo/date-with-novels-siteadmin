"use client"
import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Folder, FolderOpen, ImageIcon, Eye, Trash2, Upload, ArrowLeft, FolderTree, GripVertical } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import { motion, AnimatePresence } from 'framer-motion'
import { getAllFolders, createFolder, FolderType } from '@/app/actions/siteadmin/folders'
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
import { CSS } from '@dnd-kit/utilities'
import { getPackageMediaFiles, deletePackageMediaFile } from '@/app/actions/siteadmin/image_uploader'
import SortableImage from '@/components/siteadmin/MediaBrowser/SortableImage'

export interface ImageItem {
    id: string;
    alt: string;
    src: string;
    file_path: string;
}

export default function MediaBrowserPage({ packageId }: { packageId: string | number }) {
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
    const [previousFolder, setPreviousFolder] = useState<string | null>(null)
    const [uploadsState, setUploadsState] = useState<ImageItem[]>([])
    const [activeUploadId, setActiveUploadId] = useState<string | null>(null)
    const [deleteMode, setDeleteMode] = useState(false)
    const [selectedForDelete, setSelectedForDelete] = useState<Set<string>>(new Set())

    // Folders state & Create Folder dialog
    const [allFolders, setAllFolders] = useState<FolderType[]>([])
    const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false)
    const [folderName, setFolderName] = useState("")
    const [parentFolderId, setParentFolderId] = useState<string | null>(null)

    // Fetch all folders for folder tree
    useEffect(() => {
        async function fetchFolders() {
            try {
                const data = await getAllFolders()
                setAllFolders(data)
            } catch (err) {
                console.error("Failed to fetch all folders:", err)
            }
        }
        fetchFolders()
    }, [])

    // Fetch package media files using your real function
    useEffect(() => {
        async function fetchMedia() {
            try {
                const media = await getPackageMediaFiles(Number(packageId))
                setUploadsState(media)
            } catch (err) {
                console.error("Failed to fetch media:", err)
            }
        }
        if (packageId) {
            fetchMedia()
        }
    }, [packageId])

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

    const selectedFolderObj = allFolders.find(f => f.slug === selectedFolder)

    // Normalize selected folder (remove any leading slashes)
    const normalizedFolder = selectedFolder ? selectedFolder.replace(/^\/+/, '') : '';

    // Get child folders as usual
    const childFolders = allFolders.filter(
        f => f.parent_id === selectedFolderObj?.id || (!selectedFolder && f.parent_id === null)
    );

    // Filter out the duplicate folder that is simply a leading slash version of the current folder
    const filteredChildFolders = childFolders.filter(
        folder => folder.slug !== `/${normalizedFolder}`
    );

    // Show images only if a folder is selected and filteredChildFolders is empty
    const visibleUploads =
        normalizedFolder && filteredChildFolders.length === 0
            ? uploadsState.filter(file =>
                file.file_path.startsWith(normalizedFolder)
            )
            : [];

    // Debug logs (remove after verifying)
    useEffect(() => {
        console.log("Selected Folder (normalized):", normalizedFolder);
        uploadsState.forEach(file => console.log("File path:", file.file_path));
    }, [normalizedFolder, uploadsState]);

    // For folder breadcrumb trail
    const getPathTrail = () => {
        const trail = []
        let current = selectedFolderObj
        while (current) {
            trail.unshift(current.name)
            current = allFolders.find((f) => f.id === current?.parent_id)
        }
        return trail
    }

    // For folder slide animation
    const direction = (() => {
        const prevIndex = allFolders.findIndex(f => f.slug === previousFolder)
        const currIndex = allFolders.findIndex(f => f.slug === selectedFolder)
        return currIndex > prevIndex ? 'left' : 'right'
    })()

    const activeUpload = visibleUploads.find(file => file.id === activeUploadId)

    // Handler to create a folder
    const handleCreateFolder = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        let derivedParentType = "packages"
        let derivedSlug = folderName
        let derivedName = folderName

        if (parentFolderId) {
            const parentFolder = allFolders.find((f) => f.id === parentFolderId)
            if (!parentFolder) {
                console.error("Parent folder not found.")
                return
            }
            derivedParentType = parentFolder.parent_type
            const parentSlugNormalized = parentFolder.slug.replace(/^\/+/, "")
            derivedSlug = parentSlugNormalized
                ? `${parentSlugNormalized}/${folderName}`
                : folderName
            derivedName = folderName
        }

        try {
            await createFolder({
                name: derivedName,
                slug: derivedSlug,
                parentType: derivedParentType,
            })
            setCreateFolderDialogOpen(false)
            setFolderName("")
            setParentFolderId(null)
        } catch (err: any) {
            console.error("Failed to create folder:", err)
        }
    }


    return (
        <div className="flex w-full h-full min-h-[85vh] gap-4 p-4">
            <div className="w-1/4 border rounded-md p-4 flex flex-col justify-between overflow-hidden">
                {/* Folders Management */}
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
                                const parent = allFolders.find((f) => f.id === selectedFolderObj.parent_id)
                                setPreviousFolder(selectedFolder)
                                setSelectedFolder(parent?.slug || null)
                            }}
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back to {allFolders.find((f) => f.id === selectedFolderObj.parent_id)?.name || 'Root'}
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
                            {childFolders.map((folder) => {
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
                    <div className="text-xs text-muted-foreground">/{getPathTrail().join(" / ")}</div>
                </div>
                {/* Create Folder Dialog */}
                <div className="mt-4">
                    <Dialog open={createFolderDialogOpen} onOpenChange={setCreateFolderDialogOpen}>
                        <DialogTrigger asChild>
                            <Button disableLoader size="sm" variant="outline">
                                <FolderOpen className="w-4 h-4 mr-1" /> Create Folder
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-sm">
                            <DialogTitle>Create New Folder</DialogTitle>
                            <form onSubmit={handleCreateFolder}>
                                <div className="mb-4">
                                    <label htmlFor="folderName" className="block text-sm font-medium text-muted-foreground">
                                        Folder Name
                                    </label>
                                    <input
                                        id="folderName"
                                        type="text"
                                        value={folderName}
                                        onChange={(e) => setFolderName(e.target.value)}
                                        className="mt-1 block w-full border rounded-md p-2"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="parentFolder" className="block text-sm font-medium text-muted-foreground">
                                        Parent Folder
                                    </label>
                                    <select
                                        id="parentFolder"
                                        value={parentFolderId || "none"}
                                        onChange={(e) => setParentFolderId(e.target.value === "none" ? null : e.target.value)}
                                        className="mt-1 block w-full border rounded-md p-2"
                                    >
                                        <option value="none">None</option>
                                        {allFolders.map((folder) => (
                                            <option key={folder.id} value={folder.id}>
                                                {folder.name}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        If “None” is selected, this folder will be a root folder.
                                    </p>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="ghost" onClick={() => setCreateFolderDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" variant="default">
                                        Create
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
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
                            setUploadsState(prevUploads => {
                                const otherUploads = prevUploads.filter(
                                    file => !(selectedFolder && file.src && file.src.includes(selectedFolder))
                                )
                                return [...otherUploads, ...newVisibleUploads]
                            })
                        }
                    }}
                >
                    <SortableContext items={visibleUploads.map(item => item.id)} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {visibleUploads.map(file => (
                                <SortableImage
                                    key={file.id}
                                    image={file}
                                    selectable={deleteMode}
                                    selected={selectedForDelete.has(file.id)}
                                    onToggleSelect={() => {
                                        setSelectedForDelete((prev) => {
                                            const updated = new Set(prev)
                                            updated.has(file.id) ? updated.delete(file.id) : updated.add(file.id)
                                            return updated
                                        })
                                    }}
                                />
                            ))}
                        </div>
                    </SortableContext>
                    <DragOverlay>
                        {activeUpload ? (
                            <Card className="p-4 border-2 border-dashed border-muted bg-muted text-muted-foreground flex flex-col gap-2 items-center justify-center">
                                {activeUpload.src ? (
                                    <img src={activeUpload.src} alt={activeUpload.alt} className="w-full h-32 object-cover rounded" />
                                ) : (
                                    <ImageIcon className="w-8 h-8" />
                                )}
                                <p className="text-xs">{activeUpload.alt}</p>
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