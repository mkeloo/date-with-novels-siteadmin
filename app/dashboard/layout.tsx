import { cookies } from "next/headers"

import { AppSidebar } from "@/components/app-sidebar"
import { ModeSwitcher } from "@/components/mode-switcher"
import { NavHeader } from "@/components/nav-header"
import { ThemeSelector } from "@/components/theme-selector"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card } from "@/components/ui/card"
import TimeAndCalendar from "@/components/siteadmin/Navbar/TimeAndCalendar"
import ViewTransitionWrapper from "@/components/reusable/ViewTransitionWrapper"

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const cookieStore = await cookies()
    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";


    // const session = await auth.api.getSession({ headers: await headers() });

    // if (!session) {
    //     redirect("/login");
    // }
    // if (session.user.role !== "admin") {
    //     redirect("/unauthorized");
    // }

    return (
        <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar />
            <SidebarInset className="h-full">
                <header className="bg-background sticky inset-x-0 top-0 isolate z-10 flex shrink-0 items-center gap-2">
                    <div className="flex h-14 w-full items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1.5" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <NavHeader />
                        <div className="ml-auto flex items-center gap-2">
                            <TimeAndCalendar />
                            <ThemeSelector />
                            <ModeSwitcher />

                        </div>
                    </div>
                </header>
                {/* Main Content Area */}
                <Card className="h-full p-4 min-h-[calc(100vh-4rem)] w-full z-[1]">
                    <ViewTransitionWrapper>
                        {children}
                    </ViewTransitionWrapper>
                </Card>
            </SidebarInset>
        </SidebarProvider>
    )
}
