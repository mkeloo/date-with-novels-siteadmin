"use client"

import React, { useState } from "react"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export type DropzoneUploaderProps = {
    onSubmit: (formData: FormData) => Promise<void>
    maxFiles?: number
    maxFileSizeMB?: number
    packageId: string
    packageSlug?: string
}

export function DropzoneUploader({ onSubmit, maxFiles = 10, maxFileSizeMB = 5, packageId, packageSlug }: DropzoneUploaderProps) {
    const [files, setFiles] = useState<{ file: File; alt: string }[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState<number | null>(null)

    function handleDrop(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault()
        setIsDragging(false)
        const droppedFiles = Array.from(e.dataTransfer.files)
        handleNewFiles(droppedFiles)
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files) return
        const selected = Array.from(e.target.files)
        handleNewFiles(selected)
    }

    function handleNewFiles(selected: File[]) {
        const validFiles = selected.filter((file) => {
            const isValidSize = file.size / 1024 / 1024 <= maxFileSizeMB
            if (!isValidSize) {
                toast.warning("File too large", {
                    description: `${file.name} exceeds the ${maxFileSizeMB} MB limit.`,
                })
            }
            return isValidSize
        })

        const mapped = validFiles.map((file) => ({ file, alt: file.name }))
        setFiles((prev) => [...prev, ...mapped].slice(0, maxFiles))
    }

    function handleRemove(index: number) {
        setFiles((prev) => prev.filter((_, i) => i !== index))
    }

    function handleAltChange(index: number, value: string) {
        setFiles((prev) => {
            const updated = [...prev]
            updated[index].alt = value
            return updated
        })
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (files.length === 0) return toast.error("No files selected")

        setIsUploading(true)
        setUploadProgress(0)

        toast.loading("Uploading files...", {
            id: "upload-progress"
        })

        try {
            // Build a single FormData with all files and alt texts.
            const formData = new FormData()
            files.forEach((fileObj, idx) => {
                formData.append("files", fileObj.file)
                formData.append(`alt-${idx}`, fileObj.alt)
            })
            formData.append("ref_type", "package")
            formData.append("ref_id", packageId)
            if (packageSlug) formData.append("package_slug", packageSlug)

            // Simulate per-file progress updates.
            for (let i = 0; i < files.length; i++) {
                const progress = Math.round(((i + 1) / files.length) * 100)
                setUploadProgress(progress)

                toast.loading(`Uploading ${i + 1} / ${files.length} files...`, {
                    id: "upload-progress"
                })

                // Simulated delay per file for UI feedback.
                await new Promise((resolve) => setTimeout(resolve, 150))
            }

            // Perform one single upload of all files.
            await onSubmit(formData)

            toast.success("Upload complete", {
                id: "upload-progress",
                description: "All files have been uploaded successfully."
            })

            setFiles([])
        } catch (err: any) {
            toast.error("Upload failed", {
                id: "upload-progress",
                description: err.message
            })
        } finally {
            setIsUploading(false)
            setUploadProgress(null)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Label className="text-sm font-semibold">
                Upload up to {maxFiles} images (max {maxFileSizeMB}MB each)
            </Label>

            {/* Folder path visual feedback */}
            <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Upload folder path</Label>
                <Input
                    readOnly
                    value={`${packageSlug}`}
                    className="text-muted-foreground bg-muted cursor-not-allowed"
                />
            </div>

            <div
                onDrop={handleDrop}
                onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                className={cn(
                    "border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition",
                    isDragging ? "bg-muted/60 border-primary" : "bg-muted/30 border-muted-foreground"
                )}
            >
                <div className="flex flex-col items-center gap-2">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                    <p className="text-sm font-medium">Drop file or browse</p>
                    <p className="text-xs text-muted-foreground">
                        Format: .jpeg, .png & Max file size: {maxFileSizeMB} MB
                    </p>
                    <Input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <Button
                        type="button"
                        onClick={() => {
                            const input = document.querySelector<HTMLInputElement>('input[type="file"]')
                            if (input) {
                                input.value = ""
                                input.click()
                            }
                        }}
                        size="sm"
                        className="mt-2"
                    >
                        Browse Files
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto">
                {files.map((item, idx) => (
                    <div
                        key={idx}
                        className="flex flex-col gap-1 p-3 bg-muted rounded-md border border-muted-foreground/10"
                    >
                        {/* Top row: Input + Remove */}
                        <div className="flex items-center justify-between gap-2">
                            <Input
                                className="text-sm"
                                value={item.alt}
                                onChange={(e) => handleAltChange(idx, e.target.value)}
                                placeholder="Enter image label"
                            />
                            <Button
                                disableLoader
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-destructive bg-destructive/10 hover:!bg-destructive/20"
                                onClick={() => handleRemove(idx)}
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Bottom row: Label + File size */}
                        <div className="flex justify-between text-xs text-muted-foreground px-1">
                            <span className="truncate">{item.alt}</span>
                            <span>{(item.file.size / (1000 * 1000)).toFixed(2)} MB</span>
                        </div>
                    </div>
                ))}
            </div>

            <Button
                type="submit"
                disabled={isUploading}
                className={cn(
                    "w-full relative overflow-hidden text-background transition-all",
                    isUploading && "bg-muted text-foreground"
                )}
            >
                {/* Background fill */}
                {isUploading && uploadProgress !== null && (
                    <span
                        className="absolute inset-0 bg-primary z-0 transition-all duration-200 ease-linear"
                        style={{ width: `${uploadProgress}%` }}
                    />
                )}

                {/* Button text stays on top */}
                <span className="relative z-10">
                    {isUploading
                        ? `Uploading ${uploadProgress}%`
                        : "Upload"}
                </span>
            </Button>
        </form>
    )
}