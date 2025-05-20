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
    SquareLibrary,
    Package,
    Book,
    FileText,
    Heart,
    Star,
    Percent,
    Image,
    RefreshCw
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
        // {
        //     title: "Dashboard",
        //     url: "#",
        //     items: [
        //         {
        //             title: "Home",
        //             url: "/dashboard/analytics/sales-analytics",
        //             icon: ChartNoAxesCombined,
        //         },
        //         {
        //             title: "Settings",
        //             url: "/dashboard/analytics/ga4-analytics",
        //             icon: ChartPie,
        //         },
        //     ],
        // },
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
                    title: "Packages",
                    url: "/dashboard/product-settings/packages",
                    icon: Package,
                },
                {
                    title: "Stripe Packages Sync",
                    url: "/dashboard/product-settings/stripe-packages-sync",
                    icon: RefreshCw,
                },
                {
                    title: "Package Tiers",
                    url: "/dashboard/product-settings/package-tiers",
                    icon: SquareLibrary,
                },
                {
                    title: "Genres & Themes",
                    url: "/dashboard/product-settings/genres-themes",
                    icon: Book,
                },
            ],
        },
        // {
        //     title: "Manage Media",
        //     url: "#",
        //     items: [
        //         {
        //             title: "Media Browser",
        //             url: "/dashboard/manage-media/media-browser",
        //             icon: Image,
        //         },
        //     ],
        // },
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



export const DEFAULT_DISCLAIMER = `These are new books, Never Used. It can be Hardcover, Paperback or Mass Market Paperback.

Unfortunately, we are unable to guarantee specific books, only books by category/genre and all the books are over 3.5 on Goodread. Descriptions of books will also not be sent out. It's a surprise!

Due to the nature of this product, no returns or refunds if it's a book you already have. Decorations will vary on each book.

We kindly remind you that once we drop off your package in USPS facility, we will have no control over the package anymore. Therefore we will not be responsible for items delayed by USPS and will not issue refunds for items not received by a certain date. If you experience any issue with your package, please contact your local USPS facility.`