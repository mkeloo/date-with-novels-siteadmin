"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import { GripVertical } from "lucide-react";

import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function OrdersPage() {
    const [data, setData] = useState<Orders[]>([]);
    const [loading, setLoading] = useState(true);

    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

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
            console.log("Editing order:", order);
        } catch (err) {
            console.error("Failed to load order for edit", err);
        }
    };

    const handleDeleteOrder = useCallback(async (id: number) => {
        try {
            await deleteOrderById(id);
            setData((prev) => prev.filter((o) => o.id !== id));
        } catch (err) {
            console.error("Failed to delete order", err);
        }
    }, []);

    const columns = useMemo(
        () =>
            createOrderColumns({
                onViewOrder: handleEditOrder,
                onDeleteOrder: handleDeleteOrder,
            }),
        [handleEditOrder, handleDeleteOrder]
    );

    const table = useReactTable({
        data,
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

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = data.findIndex((item) => item.id === active.id);
        const newIndex = data.findIndex((item) => item.id === over.id);
        const reordered = arrayMove(data, oldIndex, newIndex);
        setData(reordered);
    };

    return (
        <div className="w-full max-w-[1200px] mx-auto">
            <Card className="w-full flex flex-col lg:flex-row items-center justify-between gap-4 px-6 py-4 mb-4">
                <h1 className="text-2xl font-semibold">Orders</h1>
                <div className="flex flex-wrap items-center gap-4">
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
                </div>
            </Card>

            <div className="w-full overflow-x-auto rounded-md border h-[600px]">
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={data.map((order) => order.id)} strategy={verticalListSortingStrategy}>
                        <div className="w-full h-[600px] overflow-y-auto block">
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
                                            <SortableRow key={row.id} row={row} />
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
                    </SortableContext>
                </DndContext>
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
        </div>
    );
}

function SortableRow({
    row,
}: {
    row: ReturnType<ReturnType<typeof useReactTable>["getRowModel"]>["rows"][number];
}) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: (row.original as Orders).id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <TableRow ref={setNodeRef} style={style} {...attributes}>
            {row.getVisibleCells().map((cell) => {
                const cellId = cell.column.id;
                if (cellId === "id") {
                    return (
                        <TableCell key={cell.id}>
                            <div className="cursor-grab text-gray-600 flex items-center justify-center" {...listeners}>
                                <GripVertical className="w-5 h-5" />
                            </div>
                        </TableCell>
                    );
                }

                return (
                    <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                );
            })}
        </TableRow>
    );
}