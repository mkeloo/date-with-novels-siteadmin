'use client'

import React from 'react'
import { Card } from '@/components/ui/card'

export default function LoadingSkeletonStripe() {
    return (
        <Card className="p-6 space-y-8 animate-pulse bg-muted dark:bg-muted/40 rounded-3xl">
            {/* Spinner + Message */}
            <div className="flex flex-col items-center space-y-6">
                <div className="h-20 w-20 border-4 border-sky-300 border-t-transparent rounded-full animate-spin" />
                <p className="text-center text-base text-muted-foreground">
                    Loading data from the database & Stripe…<br />
                    This may take 5–7 seconds.
                </p>
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

            {/* Top Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shimmer rounded-2xl">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="p-4 space-y-4 bg-white dark:bg-slate-900">
                        <div className="h-4 w-1/3 animate-pulse  rounded-md bg-sky-200 dark:bg-sky-900/50 " />
                        <div className="h-6 w-full animate-pulse rounded-md bg-sky-200 dark:bg-sky-900/50" />
                    </Card>
                ))}
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
        </Card>
    )
}