import React from 'react'

export default function DummyComponentPage() {
    return (
        <div>DummyComponentPage</div>
    )
}


import { buildTitle } from "@/lib/functions"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: buildTitle("Sales Analytics"),
}