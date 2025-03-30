import type { Metadata } from "next"
import { buildTitle } from "@/lib/functions"

export const metadata: Metadata = {
    title: buildTitle("Package Tiers"),
}

// This layout wraps everything under /package-tiers
export default function PackageTiersLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="w-full h-full flex flex-col gap-4 p-4">
            {children}
        </div>
    )
}