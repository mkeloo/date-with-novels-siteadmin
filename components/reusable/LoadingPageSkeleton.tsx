'use client'

import React from 'react'
import { Card } from '@/components/ui/card'

export default function LoadingPageSkeleton() {
    return (
        <Card className="p-6 space-y-6 animate-pulse bg-muted dark:bg-muted/40 rounded-3xl">
            {/* Page Header Skeleton */}
            <div className="w-full flex items-center justify-center shimmer">
                <div className="h-8 w-36 rounded-md bg-sky-300 dark:bg-sky-900/80" />
            </div>

            {/* Top Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shimmer rounded-2xl">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="p-4 space-y-4 bg-white dark:bg-slate-900">
                        <div className="h-4 w-1/3 animate-pulse  rounded-md bg-sky-200 dark:bg-sky-900/50 " />
                        <div className="h-6 w-full animate-pulse rounded-md bg-sky-200 dark:bg-sky-900/50" />
                    </Card>
                ))}
            </div>

            {/* Table Skeleton */}
            <Card className="p-4  space-y-4 rounded-2xl bg-white dark:bg-slate-900">
                <div className="w-full flex items-center justify-center shimmer">
                    <div className="h-8 w-36 rounded-md bg-sky-300 dark:bg-sky-900/80" />
                </div>

                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="grid grid-cols-8 gap-4 items-center shimmer">
                            {Array.from({ length: 8 }).map((_, j) => (
                                <Card
                                    key={j}
                                    className="h-8 animate-pulse rounded-md w-full bg-sky-200 dark:bg-sky-900/50"
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </Card>

            {/* Widget Blocks */}
            <Card className="p-4 space-y-4 bg-white dark:bg-slate-900">
                <div className="w-full flex items-center justify-center shimmer">
                    <div className="h-8 w-36 animate-pulse rounded-md bg-emerald-300 dark:bg-emerald-900" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 shimmer">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card
                            key={i}
                            className="h-20 animate-pulse rounded-lg bg-lime-300 dark:bg-lime-900/50"
                        />
                    ))}
                </div>
            </Card>
        </Card>
    )
}