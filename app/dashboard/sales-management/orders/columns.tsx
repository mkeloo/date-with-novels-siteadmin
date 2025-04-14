import { ColumnDef } from "@tanstack/react-table";
import { Orders } from "@/app/actions/siteadmin/orders";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

interface OrdersColumnOptions {
    onViewOrder: (orderId: number) => void;
    onDeleteOrder: (orderId: number) => void;
    tick: number;
}

export function createOrderColumns({
    onViewOrder,
    onDeleteOrder,
    tick,
}: OrdersColumnOptions): ColumnDef<Orders>[] {
    return [
        {
            accessorKey: "id",
            header: ({ column }) => (
                <div className="text-center">
                    <Button disableLoader variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Order ID
                        <ArrowUpDown className="ml-2" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => <div className="text-center">{row.getValue("id")}</div>,
            size: 60,
        },
        {
            accessorKey: "user_id",
            header: () => <div className="text-center">Customer</div>,
            cell: ({ row }) => (
                <div className="text-center truncate max-w-[160px]">
                    {row.getValue("user_id")}
                </div>
            ),
            size: 160,
        },
        {
            accessorKey: "package_id",
            header: () => <div className="text-center">Package</div>,
            cell: ({ row }) => (
                <div className="text-center">{row.getValue("package_id")}</div>
            ),
            size: 100,
        },
        {
            accessorKey: "transaction_id",
            header: () => <div className="text-center">Transaction</div>,
            cell: ({ row }) => (
                <div className="text-center">
                    {row.getValue("transaction_id") ?? "—"}
                </div>
            ),
            size: 100,
        },
        {
            id: "priority",
            enableSorting: true,
            header: ({ column }) => (
                <div className="text-center">
                    <Button
                        disableLoader
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Priority <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            ),
            cell: ({ row, table }) => {
                const { tick } = table.options.meta as { tick: number };

                const status = row.original.status;
                const orderedAt = new Date(row.original.ordered_at);
                const now = new Date();
                const diffMs = now.getTime() - orderedAt.getTime();
                const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                const diffMin = Math.floor((diffMs / (1000 * 60)) % 60);
                const diffSec = Math.floor((diffMs / 1000) % 60);

                const timeStr = `${String(diffHrs).padStart(2, "0")}:${String(diffMin).padStart(2, "0")}:${String(diffSec).padStart(2, "0")}`;

                let priority = "Low";
                let bgClass = "bg-green-700";

                if (status !== "shipped") {
                    if (diffMs >= 1000 * 60 * 60 * 48) {
                        priority = "High";
                        bgClass = "bg-red-700";
                    } else if (diffMs >= 1000 * 60 * 60 * 24) {
                        priority = "Medium";
                        bgClass = "bg-yellow-600";
                    }
                }

                // Return a full-width styled div to fill the TableCell area
                return (
                    <div className={`w-full h-full px-2 py-2 font-bold font-mono text-center rounded text-white ${bgClass} transition-colors duration-500 ease-in-out`}>
                        {priority} <span className="text-[13px]">({timeStr})</span>
                    </div>
                );
            },
            size: 210,
        },
        // {
        //     id: "time_elapsed",
        //     header: () => <div className="text-center">Elapsed</div>,
        //     cell: ({ row, table }) => {
        //         const { tick } = table.options.meta as { tick: number };
        //         const orderedAt = new Date(row.original.ordered_at);
        //         const now = new Date();
        //         const diffMs = now.getTime() - orderedAt.getTime();
        //         const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        //         const diffMin = Math.floor((diffMs / (1000 * 60)) % 60);
        //         const diffSec = Math.floor((diffMs / 1000) % 60);
        //         const timeStr = `${String(diffHrs).padStart(2, "0")}:${String(diffMin).padStart(2, "0")}:${String(diffSec).padStart(2, "0")}`;
        //         return (
        //             <div className="text-center font-mono text-sm w-[90px]">{timeStr}</div>
        //         );
        //     },
        //     size: 100,
        // },
        {
            accessorKey: "status",
            enableSorting: true,
            header: ({ column }) => (
                <div className="text-center">
                    <Button
                        disableLoader
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Status <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => {
                const status = row.getValue<string>("status");

                let label = "";
                let icon = null;
                let bgClass = "";
                let iconColor = "text-white";

                switch (status) {
                    case "received":
                        label = "Received";
                        icon = "Inbox";
                        bgClass = "bg-sky-500 text-white"; // Flashy red/pink for attention
                        break;
                    case "preparing":
                        label = "Preparing";
                        icon = "ChefHat";
                        bgClass = "bg-violet-600 text-white"; // Warm and active
                        break;
                    case "packing":
                        label = "Packing";
                        icon = "Package";
                        bgClass = "bg-rose-500 text-white"; // Bright yellow
                        break;
                    case "shipped":
                        label = "Shipped";
                        icon = "Truck";
                        bgClass = "bg-orange-400 text-white"; // Cool blue
                        break;
                    case "delivered":
                        label = "Delivered";
                        icon = "CheckCircle";
                        bgClass = "bg-green-600 text-white"; // Confident success green
                        break;
                    default:
                        label = "Unknown";
                        icon = "HelpCircle";
                        bgClass = "bg-neutral-400 text-white";
                }

                const Icon = require("lucide-react")[icon];

                return (
                    <div className={`w-full h-full px-2 py-2 font-bold font-mono text-center rounded flex items-center justify-start gap-2 text-sm text-white ${bgClass}`}>
                        {Icon && <Icon className={`w-6 h-6 ${iconColor}`} strokeWidth={2} />}
                        <span className="capitalize">{label}</span>
                    </div>
                );
            },
            size: 160,
        },
        {
            accessorKey: "tracking_id",
            header: () => <div className="text-center">Tracking ID</div>,
            cell: ({ row }) => (
                <div className="text-center">
                    {row.getValue("tracking_id") ?? "—"}
                </div>
            ),
            size: 180,
        },
        {
            accessorKey: "ordered_at",
            header: ({ column }) => (
                <div className="text-center">
                    <Button
                        disableLoader
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    >
                        Ordered At <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => {
                const rawVal = row.getValue<string>("ordered_at");
                const dateStr = rawVal ? new Date(rawVal).toLocaleString() : "N/A";
                return <div className="text-center">{dateStr}</div>;
            },
            size: 180,
        },
        {
            accessorKey: "updated_at",
            header: ({ column }) => (
                <div className="text-center">
                    <Button
                        disableLoader
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    >
                        Updated At <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => {
                const rawVal = row.getValue<string>("updated_at");
                const dateStr = rawVal ? new Date(rawVal).toLocaleString() : "N/A";
                return <div className="text-center">{dateStr}</div>;
            },
            size: 180,
        },
        {
            id: "actions",
            header: () => <div className="text-center">Actions</div>,
            cell: ({ row }) => {
                const order = row.original;
                return (
                    <div className="flex justify-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => onViewOrder(order.id)}>
                                    View
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onDeleteOrder(order.id)}>
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
            size: 100,
        },
    ];
}