"use client"

import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import PackageContentList from "@/components/reusable/PackageContentList"

const DEFAULT_DISCLAIMER = `These are new books, Never Used. It can be Hardcover, Paperback or Mass Market Paperback.

Unfortunately, we are unable to guarantee specific books, only books by category/genre and all the books are over 3.5 on Goodread. Descriptions of books will also not be sent out. It's a surprise!

Due to the nature of this product, no returns or refunds if it's a book you already have. Decorations will vary on each book.

We kindly remind you that once we drop off your package in USPS facility, we will have no control over the package anymore. Therefore we will not be responsible for items delayed by USPS and will not issue refunds for items not received by a certain date. If you experience any issue with your package, please contact your local USPS facility.`

export default function PackageDescriptionContentForm({
    mode,
    packageId,
}: {
    mode: "create" | "edit"
    packageId: string | null
}) {
    const [longDesc, setLongDesc] = useState("")
    const [disclaimer, setDisclaimer] = useState(DEFAULT_DISCLAIMER)
    const [packageContents, setPackageContents] = useState<string[]>([])

    const [editorWidth, setEditorWidth] = useState(60) // in %
    const isDragging = useRef(false)


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
                    <Card className="p-4">
                        <h2 className="text-lg font-bold">Long Description</h2>
                        <Textarea
                            id="longDesc"
                            rows={10}
                            value={longDesc}
                            onChange={(e) => setLongDesc(e.target.value)}
                            placeholder="Write the main product description here..."
                        />
                    </Card>

                    <PackageContentList
                        initialItems={packageContents}
                        onChange={setPackageContents}
                    />

                    <Card className="p-4">
                        <h2 className="text-lg font-bold">Disclaimer</h2>
                        <Textarea
                            id="disclaimer"
                            rows={10}
                            value={disclaimer}
                            onChange={(e) => setDisclaimer(e.target.value)}
                        />
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
                    <Card className="p-4 space-y-4 text-sm h-full min-h-full">
                        <Card className="p-4 gap-2 flex flex-col">
                            <h2 className="text-2xl font-semibold">Live Preview</h2>
                            <p className="text-muted-foreground text-sm">
                                This is how the package description will appear to customers.
                            </p>
                        </Card>

                        <div>
                            <h4 className="font-semibold mb-1">Description</h4>
                            <p className="whitespace-pre-line text-muted-foreground">
                                {longDesc || "No description provided yet."}
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-1">Contents</h4>
                            <ul className="list-disc pl-5 text-muted-foreground whitespace-pre-line">
                                {packageContents.length > 0
                                    ? packageContents.map((item, idx) => <li key={idx}>{item}</li>)
                                    : <li>No contents listed.</li>}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-1">Disclaimer</h4>
                            <p className="whitespace-pre-line text-muted-foreground">
                                {disclaimer}
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}