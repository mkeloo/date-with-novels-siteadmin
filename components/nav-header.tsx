"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Home, Settings, Settings2, SettingsIcon, SlidersHorizontal, Wallpaper } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";

export function NavHeader() {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile: show dropdown menu on small screens */}
            <div className="flex lg:hidden w-full justify-end">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild className="w-8 h-8 rounded-sm bg-blue-800 text-white">
                        <SlidersHorizontal className="p-2 h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-40">
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard" className="flex items-center">
                                <Home className="text-black dark:text-white  h-4 w-4" />
                                Home
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/settings" className="flex items-center">
                                <Settings className="text-black dark:text-white  h-4 w-4" />
                                Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link
                                href="https://datewithnovels.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center"
                            >
                                <Wallpaper className="text-black dark:text-white  h-4 w-4" />
                                Live Website
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Desktop: show full navigation menu for md and up */}
            <div className="hidden lg:flex">
                <NavigationMenu>
                    <NavigationMenuList className="gap-2 *:data-[slot=navigation-menu-item]:h-7 **:data-[slot=navigation-menu-link]:py-1 **:data-[slot=navigation-menu-link]:font-medium">
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <Link
                                    href="/dashboard"
                                    className="flex flex-row items-center text-xs lg:text-sm"
                                >
                                    <Home className="text-black dark:text-white  h-4 w-4" />
                                    Home
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <Link
                                    href="/dashboard/settings"
                                    className="flex flex-row items-center text-xs lg:text-sm"
                                >
                                    <Settings className="text-black dark:text-white  h-4 w-4" />
                                    Settings
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <Link
                                    href="https://datewithnovels.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-row items-center text-xs lg:text-sm"
                                >
                                    <Wallpaper className="text-black dark:text-white  h-4 w-4" />
                                    Live Website
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        {/* <NavigationMenuItem>
                            <NavigationMenuLink asChild data-active={pathname === "/"}>
                                <Link href="/">Home</Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild data-active={pathname === "/charts"}>
                                <Link href="/charts">Charts</Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild data-active={pathname === "/forms"}>
                                <Link href="/forms">Forms</Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem> */}
                    </NavigationMenuList>
                </NavigationMenu>
            </div>
        </>
    );
}