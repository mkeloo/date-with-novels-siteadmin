import { Card } from '@/components/ui/card'
import React from 'react'

export default function PackageMediaForm({
    mode,
    packageId,
}: {
    mode: "create" | "edit"
    packageId: string | null
}) {
    return (
        <Card className="w-full h-full p-4 gap-4 flex flex-col">
            PackageMediaForm
        </Card>
    )
}
