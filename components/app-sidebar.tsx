"use client"

import * as React from "react"
import {
    AudioWaveform,
    BookOpen,
    BookOpenText,
    Bot,
    ChevronRightIcon,
    Command,
    GalleryVerticalEnd,
    Search,
    Settings2,
    SquareTerminal,
    Store,
    ChartNoAxesCombined,
    ChartPie,
    ShoppingCart,
    Users,
    DollarSign,
    Package,
    Book,
    FileText,
    Heart,
    Star,
    Percent,
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInput,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
    SidebarSeparator,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
    user: {
        name: "Admin User",
        email: "admin@siteadmin.com",
    },
    company: {
        name: "Date with Novels",
        logo: BookOpenText,
    },
    teams: [
        {
            name: "Acme Inc",
            logo: GalleryVerticalEnd,
            plan: "Enterprise",
        },
        {
            name: "Acme Corp.",
            logo: AudioWaveform,
            plan: "Startup",
        },
        {
            name: "Evil Corp.",
            logo: Command,
            plan: "Free",
        },
    ],
    navMain: [
        {
            title: "Playground",
            url: "#",
            icon: SquareTerminal,
            isActive: true,
            items: [
                {
                    title: "History",
                    url: "#",
                },
                {
                    title: "Starred",
                    url: "#",
                },
                {
                    title: "Settings",
                    url: "#",
                },
            ],
        },
        {
            title: "Models",
            url: "#",
            icon: Bot,
            items: [
                {
                    title: "Genesis",
                    url: "#",
                },
                {
                    title: "Explorer",
                    url: "#",
                },
                {
                    title: "Quantum",
                    url: "#",
                },
            ],
        },
        {
            title: "Documentation",
            url: "#",
            icon: BookOpen,
            items: [
                {
                    title: "Introduction",
                    url: "#",
                },
                {
                    title: "Get Started",
                    url: "#",
                },
                {
                    title: "Tutorials",
                    url: "#",
                },
                {
                    title: "Changelog",
                    url: "#",
                },
            ],
        },
        {
            title: "Settings",
            url: "#",
            icon: Settings2,
            items: [
                {
                    title: "General",
                    url: "#",
                },
                {
                    title: "Team",
                    url: "#",
                },
                {
                    title: "Billing",
                    url: "#",
                },
                {
                    title: "Limits",
                    url: "#",
                },
            ],
        },
    ],
    navSecondary: [
        {
            title: "Analytics",
            url: "#",
            items: [
                {
                    title: "Sales Analytics",
                    url: "/dashboard/analytics/sales-analytics",
                    icon: ChartNoAxesCombined,
                },
                {
                    title: "GA4 Analytics",
                    url: "/dashboard/analytics/ga4-analytics",
                    icon: ChartPie,
                },
            ],
        },
        {
            title: "Sales Management",
            url: "#",
            items: [
                {
                    title: "Orders",
                    url: "/dashboard/sales-management/vapes",
                    icon: ShoppingCart,
                },
                {
                    title: "Customers",
                    url: "/dashboard/sales-management/hemp-flowers",
                    icon: Users,
                },
                {
                    title: "Transactions",
                    url: "/dashboard/sales-management/deals-&-promos",
                    icon: DollarSign,
                },
            ],
        },
        {
            title: "Product Categories",
            url: "#",
            items: [
                {
                    title: "Package Tiers",
                    url: "/dashboard/product-categories/package-tiers",
                    icon: Package,
                },
                {
                    title: "Book Genres",
                    url: "/dashboard/product-categories/book-genres",
                    icon: Book,
                },
            ],
        },
        {
            title: "Manage Pages",
            url: "#",
            items: [
                { title: "First Chapter Edition", url: "/dashboard/manage-pages/first-chapter-edition", icon: FileText },
                { title: "Classic Edition", url: "/dashboard/manage-pages/classic-edition", icon: FileText },
                { title: "Themed Edition", url: "/dashboard/manage-pages/themed-edition", icon: FileText },
                { title: "Nurse Theme", url: "/dashboard/manage-pages/themed-edition/nurse", icon: FileText },
                { title: "Valentines Theme", url: "/dashboard/manage-pages/themed-edition/valentines", icon: FileText },
            ],
        },
        {
            title: "Promotions & Testimonials",
            url: "#",
            items: [
                {
                    title: "Promos & Discounts",
                    url: "/dashboard/promotion-&-testimonials/promos",
                    icon: Percent,
                },
                {
                    title: "Testimonials",
                    url: "/dashboard/promotion-&-testimonials/testimonials",
                    icon: Star,
                },
            ],
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader className="w-full flex items-center justify-center pt-4">
                <SidebarGroup className="py-0">
                    <SidebarGroupContent className="w-full flex flex-row items-center justify-start gap-x-4">
                        {/* Ensure the Store icon always remains visible */}
                        {data.company.logo && (
                            <data.company.logo className="h-6 w-6 shrink-0" />
                        )}

                        {/* Hide the title when the sidebar is collapsed */}
                        <h1 className="text-[22px] font-bold text-center group-data-[collapsible=icon]:hidden">
                            {data.company.name}
                        </h1>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarHeader>
            <SidebarContent>
                {/* <SidebarGroup>
                    <SidebarGroupLabel>Platform</SidebarGroupLabel>
                    <SidebarMenu>
                        {data.navMain.map((item) => (
                            <Collapsible
                                key={item.title}
                                asChild
                                defaultOpen={item.isActive}
                                className="group/collapsible"
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton tooltip={item.title}>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                            <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {item.items?.map((subItem) => (
                                                <SidebarMenuSubItem key={subItem.title}>
                                                    <SidebarMenuSubButton asChild>
                                                        <a href={subItem.url}>
                                                            <span>{subItem.title}</span>
                                                        </a>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        ))}
                    </SidebarMenu>
                </SidebarGroup> */}
                <SidebarGroup className="px-4 group-data-[collapsible=icon]:p-2 mt-2 gap-3">
                    {data.navSecondary.map((section) => (
                        <div key={section.title}>
                            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
                            <SidebarSeparator className="hidden group-data-[collapsible=icon]:block group-data-[collapsible=icon]:mx-0 group-data-[collapsible=icon]:mb-1" />
                            <SidebarMenu>
                                {section.items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <a href={item.url} className="flex items-center gap-2">
                                                {item.icon && (
                                                    <item.icon className="h-6 w-6 group-data-[collapsible=icon]:h-4 group-data-[collapsible=icon]:w-4" />
                                                )}
                                                <span className="group-data-[collapsible=icon]:hidden">
                                                    {item.title}
                                                </span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </div>
                    ))}
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}