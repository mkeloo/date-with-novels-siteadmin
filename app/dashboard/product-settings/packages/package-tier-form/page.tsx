// app/dashboard/product-settings/package-tiers/package-tier-form/page.tsx
"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import PackageTierFormClient from "@/components/siteadmin/Pages/PackageTierFormClient"
import PackageDescriptionContentForm from "@/components/siteadmin/Pages/PackageDescriptionContentForm"
import { Card } from "@/components/ui/card"
import { useState } from "react"
import PackageMediaForm from "@/components/siteadmin/Pages/PackageMediaForm"

export default function PackageTierFormPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("info")


    const mode = (searchParams.get("mode") === "edit" ? "edit" : "create") as "create" | "edit"
    const id = searchParams.get("id") || null
    const initialId = searchParams.get("id") || null
    const [packageId, setPackageId] = useState<string | null>(initialId)

    // Optional: Update URL with new ID after creation
    const handlePackageCreated = (newId: number) => {
        setPackageId(newId.toString())
    }

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <Card className="w-full flex flex-col items-center justify-center gap-4 p-4 mb-2">
                <TabsList className="my-4 rounded-xl bg-muted p-1 mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 md:gap-2">
                    <TabsTrigger
                        value="info"
                        className="data-[state=active]:bg-primary data-[state=active]:text-white text-base lg:text-lg font-bold tracking-wide rounded-xl px-10 py-3 w-full border-2 active:scale-90 transition-transform duration-200"
                    >
                        Package Details
                    </TabsTrigger>
                    <TabsTrigger
                        value="media"
                        className="data-[state=active]:bg-primary data-[state=active]:text-white text-base lg:text-lg font-bold tracking-wide rounded-xl px-10 py-3 w-full border-2 active:scale-90 transition-transform duration-200"
                    >
                        Package Media
                    </TabsTrigger>
                    <TabsTrigger
                        value="description"
                        className="data-[state=active]:bg-primary data-[state=active]:text-white text-base lg:text-lg font-bold tracking-wide rounded-xl px-10 py-3 w-full border-2 active:scale-90 transition-transform duration-200"
                    >
                        Package Content
                    </TabsTrigger>
                </TabsList>
            </Card>

            <TabsContent value="info" className="tab-transition">
                <PackageTierFormClient mode={mode} packageId={id} onPackageCreated={handlePackageCreated} onGoToMediaTab={() => setActiveTab("media")} // 🟢 pass callback down
                />
            </TabsContent>

            <TabsContent value="media" className="tab-transition">
                {packageId ? (
                    <PackageMediaForm mode={mode} packageId={packageId} />
                ) : (
                    <div className="p-4 text-center text-base text-muted-foreground">
                        Please  <span className="font-bold">create and save the package first</span> in the <span className="font-bold">Package Details Tab</span> before <span className="font-bold">managing media uploads</span>.
                    </div>
                )}
            </TabsContent>

            <TabsContent value="description" className="tab-transition">
                {packageId ? (
                    <PackageDescriptionContentForm mode={mode} packageId={packageId} />
                ) : (
                    <div className="p-4 text-center text-base text-muted-foreground">
                        Please  <span className="font-bold">create and save the package first</span> in the <span className="font-bold">Package Details Tab</span> before <span className="font-bold">adding description content</span>.
                    </div>
                )}
            </TabsContent>
        </Tabs>
    )
}