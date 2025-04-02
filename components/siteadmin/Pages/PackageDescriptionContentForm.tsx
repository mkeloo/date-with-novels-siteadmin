"use client"

import { useState } from "react"
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

    return (
        <div className="w-full h-full gap-4 flex flex-col">


            <div className="w-full h-full flex flex-col lg:flex-row items-stretch justify-between gap-4">

                {/* Editor Section */}
                <Card className="w-full lg:w-[60%] flex flex-col gap-4 p-4">
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

                {/* Preview Section */}
                <div className="w-full lg:w-[40%]">
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