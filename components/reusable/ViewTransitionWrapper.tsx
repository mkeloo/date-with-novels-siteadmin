'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import LoadingPageSkeleton from './LoadingPageSkeleton'

export default function ViewTransitionWrapper({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const [ready, setReady] = useState(false)

    // Simulate a loading delay (for demonstration)
    useEffect(() => {
        const timer = setTimeout(() => setReady(true), 250)
        return () => clearTimeout(timer)
    }, [pathname])

    // Trigger the view transition on route change
    useEffect(() => {
        if (!document.startViewTransition) return
        document.startViewTransition(() => {
            // You can optionally perform additional tasks here.
        })
    }, [pathname])

    if (!ready) return <LoadingPageSkeleton />

    return <>{children}</>
}