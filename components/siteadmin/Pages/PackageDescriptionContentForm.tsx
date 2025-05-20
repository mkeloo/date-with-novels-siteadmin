"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import PackageContentList from "@/components/reusable/PackageContentList"
import { DEFAULT_DISCLAIMER } from "@/utils/data/sidebarData"
import { createPackageDescription, getPackageDescriptionByPackageId, upsertPackageDescriptionByPackageId } from "@/app/actions/siteadmin/package_descriptions"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { z } from "zod"

// Define a Zod schema for the package description form.
const packageDescSchema = z.object({
    long_description: z.string().min(1, { message: "Long description is required" }),
    reader_notice: z.string().min(1, { message: "Disclaimer is required" }),
    package_contents: z.array(z.string()).min(1, { message: "At least one package content is required" }),
})

export default function PackageDescriptionContentForm({
    mode,
    packageId,
}: {
    mode: "create" | "edit"
    packageId: string | null
}) {
    const router = useRouter()

    const [longDesc, setLongDesc] = useState("")
    const [disclaimer, setDisclaimer] = useState(DEFAULT_DISCLAIMER)
    const [packageContents, setPackageContents] = useState<string[]>([])

    // For inline error messages
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    const [editorWidth, setEditorWidth] = useState(60) // in %
    const isDragging = useRef(false)

    // useEffect(() => {
    //     async function fetchPackageDetails(id: number) {
    //         try {
    //             let data: PackageDescription = await getPackageDescriptionByPackageId(id)
    //             const plainData = JSON.parse(JSON.stringify(data))
    //             setLongDesc(plainData.long_description || "")
    //             setDisclaimer(plainData.reader_notice || DEFAULT_DISCLAIMER)
    //             setPackageContents(plainData.package_contents || [])
    //         } catch (error) {
    //             console.error("Failed to fetch package description:", error)
    //         }
    //     }

    //     if (mode === "edit" && packageId) {
    //         fetchPackageDetails(Number(packageId))
    //     }
    // }, [mode, packageId])

    useEffect(() => {
        async function fetchPackageDetails(id: number) {
            try {
                const data = await getPackageDescriptionByPackageId(id)

                setLongDesc(data.long_description || "")
                setDisclaimer(data.reader_notice || DEFAULT_DISCLAIMER)
                setPackageContents(data.package_contents || [])
            } catch (error) {
                // If no record exists, silently skip (or optionally log)
                console.warn("No existing package description found. It will be created on save.")
            }
        }

        if (mode === "edit" && packageId) {
            fetchPackageDetails(Number(packageId))
        }
    }, [mode, packageId])

    const DIVIDER_WIDTH_PX = 40 // width 4px + 2*margin 2px

    const handleMouseDown = () => {
        isDragging.current = true
        document.body.style.cursor = "col-resize"
        document.body.classList.add("disable-selection")
    }

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging.current) return
        const containerWidth = window.innerWidth
        const newEditorWidth = (e.clientX / containerWidth) * 100
        if (newEditorWidth > 30 && newEditorWidth < 70) {
            setEditorWidth(newEditorWidth)
        }
    }

    const handleMouseUp = () => {
        isDragging.current = false
        document.body.style.cursor = "default"
        document.body.classList.remove("disable-selection")
    }

    // Attach listeners only once
    if (typeof window !== "undefined") {
        window.onmousemove = handleMouseMove
        window.onmouseup = handleMouseUp
    }

    // Function to validate and save the package description
    const handleSave = async () => {
        if (!packageId) return

        const payload = {
            long_description: longDesc,
            reader_notice: disclaimer,
            package_contents: packageContents,
        }

        const result = packageDescSchema.safeParse(payload)
        if (!result.success) {
            const errors: Record<string, string> = {}
            for (const [field, messages] of Object.entries(result.error.formErrors.fieldErrors)) {
                if (messages && messages.length > 0) {
                    errors[field] = messages[0]
                }
            }
            setFormErrors(errors)
            return
        }
        setFormErrors({})

        try {
            if (mode === "edit") {
                // Use upsert – it will update if exists, or create if not
                await upsertPackageDescriptionByPackageId(Number(packageId), payload)
            } else {
                await createPackageDescription({
                    package_id: Number(packageId),
                    ...payload,
                })
            }
            router.push("/dashboard/product-settings/packages")
        } catch (error) {
            console.error("Error saving package description:", error)
        }
    }

    return (
        <div className="w-full h-full gap-4 flex flex-col">
            <div className="w-full h-full flex flex-col lg:flex-row items-stretch justify-between relative">
                {/* Editor Section */}
                <Card
                    className="h-full p-4 gap-4 flex flex-col"
                    style={{ flex: `0 0 calc(${editorWidth}% - ${DIVIDER_WIDTH_PX / 2}px)` }}
                >
                    <Card className="p-4 gap-2 flex flex-col">
                        <h2 className="text-2xl font-semibold">Package Description Content</h2>
                        <p className="text-muted-foreground text-sm">
                            Add package information including its purpose, included items, and any disclaimers.
                        </p>
                    </Card>
                    <Card className="p-4 gap-3">
                        <h3 className="text-lg font-bold">Long Description</h3>
                        <Textarea
                            id="longDesc"
                            rows={10}
                            value={longDesc}
                            onChange={(e) => setLongDesc(e.target.value)}
                            placeholder="Write the main product description here..."
                        />
                        {formErrors.long_description && (
                            <p className="text-red-500 text-sm">{formErrors.long_description}</p>
                        )}
                    </Card>

                    <PackageContentList
                        key={packageContents.join(",")}
                        initialItems={packageContents}
                        onChange={setPackageContents}
                    />
                    {formErrors.package_contents && (
                        <p className="text-red-500 text-sm">{formErrors.package_contents}</p>
                    )}

                    <Card className="p-4 gap-3">
                        <h3 className="text-lg font-bold">Disclaimer</h3>
                        <Textarea
                            id="disclaimer"
                            rows={10}
                            value={disclaimer}
                            onChange={(e) => setDisclaimer(e.target.value)}
                        />
                        {formErrors.reader_notice && (
                            <p className="text-red-500 text-sm">{formErrors.reader_notice}</p>
                        )}
                    </Card>
                </Card>

                {/* Draggable Divider */}
                <div
                    className="hidden lg:flex items-center justify-center w-4 mx-4 cursor-col-resize relative group"
                    onMouseDown={handleMouseDown}
                >
                    <div className="w-1 h-full bg-muted-foreground/40 rounded-full group-hover:bg-primary transition-all duration-300" />
                </div>

                {/* Preview Section */}
                <div
                    className="flex h-full min-h-full"
                    style={{ flex: `0 0 calc(${100 - editorWidth}% - ${DIVIDER_WIDTH_PX / 2}px)` }}
                >
                    <Card className="p-4 gap-4 text-sm h-full min-h-full">
                        <Card className="p-4 gap-2 flex flex-col">
                            <h2 className="text-2xl font-semibold">Live Preview</h2>
                            <p className="text-muted-foreground text-sm">
                                This is how the package description will appear to customers.
                            </p>
                        </Card>
                        <Card className="p-4 gap-3">
                            <h3 className="text-lg font-bold">Description</h3>
                            <p className="whitespace-pre-line text-muted-foreground">
                                {longDesc || "No description provided yet."}
                            </p>
                        </Card>
                        <Card className="p-4 gap-3">
                            <h3 className="text-lg font-bold">Contents</h3>
                            <ul className="list-disc pl-5 text-muted-foreground whitespace-pre-line">
                                {packageContents.length > 0
                                    ? packageContents.map((item, idx) => <li key={idx}>{item}</li>)
                                    : <li>No contents listed.</li>}
                            </ul>
                        </Card>
                        <Card className="p-4 gap-3">
                            <h3 className="text-lg font-bold">Disclaimer</h3>
                            <p className="whitespace-pre-line text-muted-foreground">
                                {disclaimer}
                            </p>
                        </Card>
                    </Card>
                </div>
            </div>

            <div className="flex justify-end mt-4">
                <Button onClick={handleSave}>
                    {mode === "edit" ? "Update Package Description" : "Create Package Description"}
                </Button>
            </div>
        </div>
    )
}