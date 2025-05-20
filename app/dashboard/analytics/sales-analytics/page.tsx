import React from 'react'

export default function SalesAnalytics() {
    return (
        <OrdersAnalytics />
    )
}


import { buildTitle } from "@/utils/data/functions"
import type { Metadata } from "next"
import OrdersAnalytics from '@/components/siteadmin/SalesAnalytics/OrdersAnalytics'

export const metadata: Metadata = {
    title: buildTitle("Sales Analytics"),
}