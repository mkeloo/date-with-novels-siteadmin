import React from 'react'

export default function DummyComponentPage() {
    return (
        <OrdersPage />
    )
}


import { buildTitle } from "@/lib/functions"
import type { Metadata } from "next"
import OrdersPage from './orders-page'

export const metadata: Metadata = {
    title: buildTitle("Manage Orders"),
}