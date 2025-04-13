"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    ColumnFiltersState,
    ColumnResizeMode,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Orders, getAllOrders } from "@/app/actions/siteadmin/orders";
import { createOrderColumns } from "./columns";
import { Card } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function OrdersPage() {
    const [data, setData] = useState<Orders[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [columnSizing, setColumnSizing] = useState({});
    const [columnSizingInfo, setColumnSizingInfo] = useState({}); // Added state for sizing info

    useEffect(() => {
        const fetchData = async () => {
            const res = await getAllOrders();
            setData(res);
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleViewOrder = (id: number) => alert(`View order ${id}`);
    const handleDeleteOrder = (id: number) => alert(`Delete order ${id}`);

    const columns = useMemo(
        () =>
            createOrderColumns({
                onViewOrder: handleViewOrder,
                onDeleteOrder: handleDeleteOrder,
            }),
        []
    );

    const table = useReactTable({
        data,
        columns,
        enableColumnResizing: true,
        columnResizeMode: "onChange",
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination,
            columnSizing,
            // columnSizingInfo can be stored but isn’t necessarily part of your state object used for rendering
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        onColumnSizingChange: setColumnSizing, // Required for resize to update state
        onColumnSizingInfoChange: setColumnSizingInfo, // Uncommented to enable proper sizing info updates
    });

    return (
        <div className="w-full max-w-[1200px] mx-auto">
            <Card className="px-6 py-4 mb-4">
                <h1 className="text-2xl font-semibold">Orders</h1>
            </Card>

            <div className="w-full overflow-x-auto rounded-md border h-[600px]">
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
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
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

            <div className="flex justify-between items-center mt-4">
                <Button
                    variant="outline"
                    disabled={pagination.pageIndex === 0}
                    onClick={() => table.setPageIndex(pagination.pageIndex - 1)}
                >
                    Previous
                </Button>
                <span className="text-sm font-medium">
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
        </div>
    );
}