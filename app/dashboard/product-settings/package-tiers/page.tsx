import PackageTierClient from "@/components/siteadmin/Pages/PackageTierClient"
import { buildTitle } from "@/lib/functions"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: buildTitle("Package Tiers"),
}

export default function Page() {
    return (
        <div className="w-full h-full flex flex-col lg:flex-row items-stretch justify-between gap-4">
            <PackageTierClient />
        </div>
    )
}