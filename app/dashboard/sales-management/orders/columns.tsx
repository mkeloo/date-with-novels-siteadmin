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
}

export function createOrderColumns({
    onViewOrder,
    onDeleteOrder,
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
            accessorKey: "status",
            enableSorting: true,
            header: ({ column }) => (
                <div className="text-center">
                    <Button
                        disableLoader
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    >
                        Status <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => {
                const status = row.getValue<string>("status");
                return <div className="text-center capitalize">{status}</div>;
            },
            size: 120,
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