import { buildTitle } from "@/utils/data/functions"
import type { Metadata } from "next"
import Ga4AnalyticsClient from "@/components/siteadmin/Pages/Ga4AnalyticsClient"

export const metadata: Metadata = {
    title: buildTitle("GA4 Analytics"),
}

export default function Page() {
    return <Ga4AnalyticsClient />
}