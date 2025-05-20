"use client"

import * as React from "react"


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
import { data } from "@/utils/data/sidebarData"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader className="w-full flex items-center justify-center pt-4">
                <SidebarGroup className="py-0  group-data-[collapsible=icon]:p-1">
                    <SidebarGroupContent className="w-full flex flex-row items-center justify-start gap-x-4">
                        {/* Ensure the Store icon always remains visible */}
                        {data.company.logo && (
                            <a href="/dashboard" className="flex items-center justify-center group-data-[collapsible=icon]:mr-2  group-data-[collapsible=icon]:rounded-md group-data-[collapsible=icon]:bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200">
                                <data.company.logo className="h-6 w-6 shrink-0" />
                            </a>
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
                <SidebarGroup className="px-4 group-data-[collapsible=icon]:p-2  gap-4">
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