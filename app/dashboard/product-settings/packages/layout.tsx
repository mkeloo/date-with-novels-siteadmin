import type { Metadata } from "next"
import { buildTitle } from "@/utils/data/functions"

export const metadata: Metadata = {
    title: buildTitle("Package Tiers"),
}

// This layout wraps everything under /package-tiers
export default function PackageLayout({
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