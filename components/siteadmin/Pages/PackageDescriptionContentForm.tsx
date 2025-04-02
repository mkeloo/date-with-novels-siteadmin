"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
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
    const [contentsList, setContentsList] = useState("")
    const [disclaimer, setDisclaimer] = useState(DEFAULT_DISCLAIMER)

    return (
        <Card className="w-full h-full p-4 gap-4 flex flex-col">

            <Card className="p-4 gap-2 flex flex-col">
                <h2 className="text-2xl font-semibold">Package Description Content</h2>
                <p className="text-muted-foreground text-sm">
                    Provide detailed information about this package including its purpose, included items, and any disclaimers.
                </p>
            </Card>

            <div className="w-full h-full flex flex-col lg:flex-row items-stretch justify-between gap-4">
                {/* Editor Section */}
                <div className="w-full lg:w-[60%] flex flex-col gap-4">
                    <Card className="p-4 space-y-2 flex-1">
                        <Label htmlFor="longDesc">Long Description</Label>
                        <Textarea
                            id="longDesc"
                            rows={6}
                            value={longDesc}
                            onChange={(e) => setLongDesc(e.target.value)}
                            placeholder="Write the main product description here..."
                        />
                    </Card>

                    <Card className="p-4 space-y-2 flex-1">
                        <Label htmlFor="contentsList">Package Contents</Label>
                        <Textarea
                            id="contentsList"
                            rows={8}
                            value={contentsList}
                            onChange={(e) => setContentsList(e.target.value)}
                            placeholder="List all items included in this package, one per line..."
                        />

                        {/* Package Contents List Input */}
                        {/* <div>
                            <PackageContentList
                                initialItems={packageContents}
                                onChange={setPackageContents}
                            />
                        </div> */}
                    </Card>

                    <Card className="p-4 space-y-2 flex-1">
                        <Label htmlFor="disclaimer">Disclaimer</Label>
                        <Textarea
                            id="disclaimer"
                            rows={10}
                            value={disclaimer}
                            onChange={(e) => setDisclaimer(e.target.value)}
                        />
                    </Card>
                </div>

                {/* Preview Section */}
                <div className="w-full lg:w-[40%]">
                    <Card className="p-4 space-y-4 text-sm h-full min-h-full">
                        <h3 className="text-lg font-medium">Live Preview</h3>

                        <div>
                            <h4 className="font-semibold mb-1">Description</h4>
                            <p className="whitespace-pre-line text-muted-foreground">
                                {longDesc || "No description provided yet."}
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-1">Contents</h4>
                            <ul className="list-disc pl-5 text-muted-foreground whitespace-pre-line">
                                {contentsList
                                    ? contentsList.split("\n").map((item, idx) => <li key={idx}>{item}</li>)
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
        </Card>
    )
}