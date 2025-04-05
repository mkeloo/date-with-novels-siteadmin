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
    packageId: string
}

export function DropzoneUploader({ onSubmit, maxFiles = 10, packageId }: DropzoneUploaderProps) {
    const [files, setFiles] = useState<File[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)

    function handleDrop(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault()
        setIsDragging(false)
        const droppedFiles = Array.from(e.dataTransfer.files)
        setFiles((prev) => [...prev, ...droppedFiles].slice(0, maxFiles))
    }

    function handleRemove(index: number) {
        setFiles((prev) => prev.filter((_, i) => i !== index))
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files) return
        const selected = Array.from(e.target.files)
        setFiles((prev) => [...prev, ...selected].slice(0, maxFiles))
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (files.length === 0) return toast.error("No files selected")
        if (files.length > maxFiles) return toast.error(`You can only upload up to ${maxFiles} files.`)

        const formData = new FormData()
        files.forEach((file) => formData.append("files", file))
        formData.append("ref_type", "package")
        formData.append("ref_id", packageId)

        try {
            setIsUploading(true)
            await onSubmit(formData)
            toast.success("Uploaded successfully")
            setFiles([])
        } catch (err: any) {
            toast.error(`Upload failed: ${err.message}`)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Label className="text-sm font-semibold">Upload up to {maxFiles} images</Label>

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
                    <p className="text-xs text-muted-foreground">Format: .jpeg, .png & Max file size: 7 MB</p>
                    <Input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <Button
                        type="button"
                        onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                        size="sm"
                        className="mt-2"
                    >
                        Browse Files
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                {files.map((file, idx) => (
                    <div
                        key={idx}
                        className="flex items-center justify-between px-3 py-2 bg-muted rounded text-sm text-muted-foreground"
                    >
                        <span className="truncate mr-2">{file.name}</span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemove(idx)}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
            </div>

            <Button type="submit" disabled={isUploading} className="w-full">
                {isUploading ? "Uploading..." : "Upload"}
            </Button>
        </form>
    )
}
