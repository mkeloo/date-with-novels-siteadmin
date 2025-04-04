"use client"
import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Folder, FolderOpen, ImageIcon, Eye, Trash2, Upload, ArrowLeft, FolderTree } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import { motion, AnimatePresence } from 'framer-motion'

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

export default function MediaBrowserPage() {
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
    const [previousFolder, setPreviousFolder] = useState<string | null>(null)

    const handleFolderClick = (slug: string) => {
        setPreviousFolder(selectedFolder)
        setSelectedFolder(slug)
    }

    const selectedFolderObj = folders.find(f => f.slug === selectedFolder)
    const childFolders = folders.filter(f => f.parent_id === selectedFolderObj?.id || (!selectedFolder && f.parent_id === null))
    const visibleUploads = uploads.filter(file => selectedFolder && file.file_path.startsWith(selectedFolder))

    const getDirection = () => {
        const prevIndex = folders.findIndex(f => f.slug === previousFolder)
        const currIndex = folders.findIndex(f => f.slug === selectedFolder)
        return currIndex > prevIndex ? 'left' : 'right'
    }

    const direction = getDirection()

    return (
        <div className="flex w-full h-full min-h-[85vh] gap-4 p-4">
            <ScrollArea className="w-1/4 border rounded-md p-4">
                <h2 className="text-sm font-semibold mb-4">Folders</h2>

                {!selectedFolderObj && (
                    <div className="w-full mb-2 text-left text-sm px-2 py-2 rounded-md bg-muted text-muted-foreground font-medium flex">
                        <FolderTree className='w-5 h-5 mr-2' />
                        Root Directory
                    </div>
                )}

                {selectedFolderObj && (
                    <div className="w-full mb-2 text-left text-sm px-2 py-2 rounded-md bg-muted text-muted-foreground font-medium cursor-pointer flex"
                        onClick={() => {
                            const parent = folders.find(f => f.id === selectedFolderObj.parent_id)
                            setPreviousFolder(selectedFolder)
                            setSelectedFolder(parent?.slug || null)
                        }}>
                        <ArrowLeft className='w-5 h-5 mr-2' />
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
            </ScrollArea>

            <Separator orientation="vertical" className="h-full" />

            <ScrollArea className="flex-1 border rounded-md p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-sm font-semibold">Files in: {selectedFolder ?? 'Select a folder'}</h2>
                    <Button disableLoader size="sm" variant="outline">
                        <Upload className="w-4 h-4 mr-1" /> Upload
                    </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {visibleUploads.map((file) => (
                        <Card key={file.id} className="p-4 flex flex-col gap-2 items-center justify-center relative group">
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
                    ))}

                    {visibleUploads.length === 0 && (
                        <p className="text-muted-foreground text-sm col-span-full text-center">
                            No files found in this folder.
                        </p>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
