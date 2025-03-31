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

export const data = {
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
                    url: "/dashboard/sales-management/orders",
                    icon: ShoppingCart,
                },
                {
                    title: "Customers",
                    url: "/dashboard/sales-management/customers",
                    icon: Users,
                },
                {
                    title: "Transactions",
                    url: "/dashboard/sales-management/transactions",
                    icon: DollarSign,
                },
            ],
        },
        {
            title: "Product Settings",
            url: "#",
            items: [
                {
                    title: "Package Tiers",
                    url: "/dashboard/product-settings/package-tiers",
                    icon: Package,
                },
                {
                    title: "Genres & Themes",
                    url: "/dashboard/product-settings/genres-themes",
                    icon: Book,
                },
            ],
        },
        {
            title: "Manage Pages",
            url: "#",
            items: [
                { title: "First Chapter Edition", url: "/dashboard/manage-pages/first-chapter-edition/first-chapter-edition", icon: FileText },
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
