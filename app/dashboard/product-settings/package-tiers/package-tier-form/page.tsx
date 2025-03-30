// app/dashboard/product-settings/package-tiers/package-tier-form/page.tsx
"use client"

import { useSearchParams } from "next/navigation"
import PackageTierFormClient from "@/components/siteadmin/Pages/PackageTierFormClient"

export default function PackageTierFormPage() {
    const searchParams = useSearchParams()
    const mode = (searchParams.get("mode") === "edit" ? "edit" : "create") as "create" | "edit"
    const id = searchParams.get("id") || null

    return (
        <PackageTierFormClient mode={mode} packageId={id} />
    )
}