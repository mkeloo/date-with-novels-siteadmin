"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    ColumnResizeMode,
} from "@tanstack/react-table";

import { createOrderColumns } from "./columns";
import {
    getAllOrders,
    getOrderById,
    updateOrderById,
    deleteOrderById,
    Orders,
} from "@/app/actions/siteadmin/orders";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TrackingIdDialog from "@/components/siteadmin/Orders/TrackingIdDialog";
import OrderViewDialog from "@/components/siteadmin/Orders/OrderViewDialog";
import OrderDeleteDialog from "@/components/siteadmin/Orders/OrderDeleteDialog";


export default function OrdersPage() {
    const [data, setData] = useState<Orders[]>([]);
    const [loading, setLoading] = useState(true);


    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [tick, setTick] = useState(0);
    const [animatedRowId, setAnimatedRowId] = useState<number | null>(null);

    // State for modals
    const [trackingDialog, setTrackingDialog] = useState<{
        open: boolean;
        orderId: number | null;
    }>({ open: false, orderId: null });
    const [viewDialog, setViewDialog] = useState<{ open: boolean; order: Orders | null }>({ open: false, order: null });
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; orderId: number | null }>({ open: false, orderId: null });



    // Trigger re-render every second
    useEffect(() => {
        const interval = setInterval(() => {
            setTick((t) => t + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const res = await getAllOrders();
                setData(res);
            } catch (err) {
                console.error("Failed to fetch orders", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const handleEditOrder = async (id: number) => {
        try {
            const order = await getOrderById(id);
            setViewDialog({ open: true, order });
        } catch (err) {
            console.error("Failed to load order", err);
        }
    };

    const handleDeleteOrder = (id: number) => {
        setDeleteDialog({ open: true, orderId: id });
    };

    const confirmDeleteOrder = async () => {
        if (!deleteDialog.orderId) return;
        try {
            await deleteOrderById(deleteDialog.orderId);
            setData((prev) => prev.filter((o) => o.id !== deleteDialog.orderId));
        } catch (err) {
            console.error("Delete failed", err);
        } finally {
            setDeleteDialog({ open: false, orderId: null });
        }
    };


    const handleStatusChange = (id: number, newStatus: Orders["status"]) => {
        setData((prev) =>
            prev.map((order) =>
                order.id === id ? { ...order, status: newStatus, updated_at: new Date().toISOString() } : order
            )
        );
        setAnimatedRowId(id);
        setTimeout(() => setAnimatedRowId(null), 400); // animation duration
    };

    const openTrackingDialog = (orderId: number) =>
        setTrackingDialog({ open: true, orderId });

    const closeTrackingDialog = () =>
        setTrackingDialog({ open: false, orderId: null });

    const handleTrackingSubmit = async (trackingId: string) => {
        if (!trackingDialog.orderId) return;
        try {
            await updateOrderById(trackingDialog.orderId, {
                status: "shipped",
                tracking_id: trackingId,
            });
            handleStatusChange(trackingDialog.orderId, "shipped");
        } catch (err) {
            console.error("Failed to update with tracking ID", err);
        } finally {
            closeTrackingDialog();
        }
    };


    // Memoize the columns to avoid re-creating them on every render
    // This is important for performance, especially with large datasets
    const columns = useMemo(
        () =>
            createOrderColumns({
                onViewOrder: handleEditOrder,
                onDeleteOrder: handleDeleteOrder,
                onStatusChange: handleStatusChange,
                openTrackingDialog,
                tick,
                animatedRowId,
            }),
        [handleEditOrder, handleDeleteOrder, handleStatusChange, openTrackingDialog, tick, animatedRowId]
    );

    const table = useReactTable({
        data,
        meta: { tick },
        columns,
        enableColumnResizing: true,
        columnResizeMode: "onChange" as ColumnResizeMode,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination,
        },
    });

    return (
        <div className="w-full max-w-[1200px] mx-auto">
            <Card className="w-full flex flex-col lg:flex-row items-center justify-between gap-4 px-6 py-4 mb-4">
                <h1 className="text-2xl font-semibold">Orders</h1>

                {/* Total Entries Per Page */}
                <div className="flex flex-wrap items-center gap-4">
                    {/* Entries Per Page */}
                    <Select
                        value={String(pagination.pageSize)}
                        onValueChange={(val) =>
                            setPagination({ pageIndex: 0, pageSize: Number(val) })
                        }
                    >
                        <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Page size" />
                        </SelectTrigger>
                        <SelectContent>
                            {[10, 20, 30, 40, 50].map((n) => (
                                <SelectItem key={n} value={String(n)}>
                                    {n}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Filter: Status */}
                    <Select
                        onValueChange={(val) => {
                            setColumnFilters((prev) => [
                                ...prev.filter((f) => f.id !== "status"),
                                ...(val !== "all" ? [{ id: "status", value: val }] : []),
                            ])
                        }}
                        value={(table.getColumn("status")?.getFilterValue() as string) || "all"}
                    >
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Filter: Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Status: All</SelectItem>
                            {["received", "preparing", "packing", "shipped", "delivered"].map((status) => (
                                <SelectItem key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Filter: Priority */}
                    <Select
                        onValueChange={(val) => {
                            setColumnFilters((prev) => [
                                ...prev.filter((f) => f.id !== "priority"),
                                ...(val !== "all" ? [{ id: "priority", value: val }] : []),
                            ])
                        }}
                        value={(table.getColumn("priority")?.getFilterValue() as string) || "all"}
                    >
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Filter: Priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Priority: All</SelectItem>
                            {["low", "medium", "high"].map((level) => (
                                <SelectItem key={level} value={level}>
                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </Card>

            <div className="w-full overflow-x-auto rounded-md border h-[600px]">
                <div className="w-full h-[600px] overflow-y-auto block no-scrollbar">
                    <Table className="table-auto w-full">
                        <TableHeader className="sticky top-0 z-10">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        const canResize = header.column.getCanResize();
                                        const isResizing = header.column.getIsResizing();
                                        return (
                                            <TableHead
                                                key={header.id}
                                                style={{ width: header.getSize() }}
                                                className="whitespace-nowrap overflow-hidden relative"
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(header.column.columnDef.header, header.getContext())}
                                                {canResize && (
                                                    <div
                                                        onMouseDown={header.getResizeHandler()}
                                                        onTouchStart={header.getResizeHandler()}
                                                        className={`absolute right-0 top-0 h-full w-2 cursor-col-resize select-none bg-transparent ${isResizing ? "bg-blue-500 opacity-40" : ""
                                                            }`}
                                                    />
                                                )}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className="flex justify-between items-center mt-4">
                <Button
                    variant="outline"
                    disabled={pagination.pageIndex === 0}
                    onClick={() => table.setPageIndex(pagination.pageIndex - 1)}
                >
                    Previous
                </Button>
                <span className="text-sm md:text-base lg:text-lg font-medium">
                    Page {pagination.pageIndex + 1} of {table.getPageCount()}
                </span>
                <Button
                    variant="outline"
                    disabled={pagination.pageIndex + 1 >= table.getPageCount()}
                    onClick={() => table.setPageIndex(pagination.pageIndex + 1)}
                >
                    Next
                </Button>
            </div>


            {/* Dialog Boxes */}
            <TrackingIdDialog
                open={trackingDialog.open}
                onClose={closeTrackingDialog}
                onConfirm={handleTrackingSubmit}
            />

            <OrderViewDialog
                open={viewDialog.open}
                order={viewDialog.order}
                onClose={() => setViewDialog({ open: false, order: null })}
            />

            <OrderDeleteDialog
                open={deleteDialog.open}
                orderId={deleteDialog.orderId}
                onClose={() => setDeleteDialog({ open: false, orderId: null })}
                onConfirm={confirmDeleteOrder}
            />
        </div>
    );
}