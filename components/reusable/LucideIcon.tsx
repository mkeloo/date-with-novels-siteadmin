"use client"

import React, { Suspense } from "react"

type LucideIconProps = {
    iconName: string
    className?: string
}

export default function LucideIcon({
    iconName = "Book",
    className = "w-5 h-5 text-foreground",
}: LucideIconProps) {
    const iconToRender = iconName?.trim() || "Book"
    const IconModule = require("lucide-react")
    const IconComponent =
        IconModule[iconToRender as keyof typeof IconModule] || IconModule["Book"]

    return (
        <Suspense fallback={<span className="text-xs">...</span>}>
            {React.createElement(IconComponent, { className })}
        </Suspense>
    )
}
