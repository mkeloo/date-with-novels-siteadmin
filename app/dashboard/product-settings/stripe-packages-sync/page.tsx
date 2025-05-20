import React from 'react'
import { buildTitle } from "@/utils/data/functions"
import type { Metadata } from "next"
import StripePackagesSyncClient from '@/components/siteadmin/Pages/StripePackagesSyncClient'

export const metadata: Metadata = {
    title: buildTitle("Stripe Packages Sync"),
    description: "Sync your packages with Stripe",
}
export default function StripePackagesSyncPage() {
    return (
        <StripePackagesSyncClient />
    )
}
