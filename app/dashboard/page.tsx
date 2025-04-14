import { SonnerDemo } from "@/components/ui/sonner-demo"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"


export default function Page() {
    return (
        <>
            <header className="flex flex-col h- shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">

                <div className="flex h-full w-full flex-col gap-4 overflow-hidden">
                    <Card className="w-full border-0 flex flex-col lg:flex-row items-center justify-center gap-4 px-6 py-4 mb-4">
                        <h1 className="text-4xl font-semibold">Today's Tasks</h1>
                    </Card>
                </div>


                <div className="w-full flex items-start gap-2 px-4">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="#">
                                    Building Your Application
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>

            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="aspect-video rounded-xl bg-muted/50" />
                    <div className="aspect-video rounded-xl bg-muted/50" />
                    <div className="aspect-video rounded-xl bg-muted/50" />
                </div>
                <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
                <div className='relative flex flex-col items-center'>
                    <SonnerDemo />
                </div>
            </div>
        </>
    )
}


import { buildTitle } from "@/lib/functions"
import type { Metadata } from "next"
import { Card } from "@/components/ui/card"

export const metadata: Metadata = {
    title: buildTitle("Dashboard"),
}