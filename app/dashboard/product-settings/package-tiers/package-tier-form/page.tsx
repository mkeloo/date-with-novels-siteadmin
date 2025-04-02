// app/dashboard/product-settings/package-tiers/package-tier-form/page.tsx
"use client"

import { useSearchParams } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import PackageTierFormClient from "@/components/siteadmin/Pages/PackageTierFormClient"
import PackageDescriptionContentForm from "@/components/siteadmin/Pages/PackageDescriptionContentForm"
import { Card } from "@/components/ui/card"

export default function PackageTierFormPage() {
    const searchParams = useSearchParams()
    const mode = (searchParams.get("mode") === "edit" ? "edit" : "create") as "create" | "edit"
    const id = searchParams.get("id") || null

    return (
        <Tabs defaultValue="info" className="w-full">
            <Card className="w-full flex flex-col items-center justify-center gap-4 p-4">
                <TabsList className="my-4 rounded-xl bg-muted p-1 mx-auto grid grid-cols-2 gap-2">
                    <TabsTrigger
                        value="info"
                        className="data-[state=active]:bg-primary data-[state=active]:text-white text-lg font-bold tracking-wide rounded-xl px-10 py-3 w-full border-2"
                    >
                        Package Information
                    </TabsTrigger>
                    <TabsTrigger
                        value="description"
                        className="data-[state=active]:bg-primary data-[state=active]:text-white text-lg font-bold tracking-wide rounded-xl px-10 py-3 w-full border-2"
                    >
                        Package Content
                    </TabsTrigger>
                </TabsList>
            </Card>

            <TabsContent value="info">
                <PackageTierFormClient mode={mode} packageId={id} />
            </TabsContent>

            <TabsContent value="description">
                <PackageDescriptionContentForm mode={mode} packageId={id} />
            </TabsContent>
        </Tabs>
    )
}