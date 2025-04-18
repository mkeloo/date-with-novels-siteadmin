"use client"

import React, { useEffect, useState } from "react"
import { TrendingUp } from "lucide-react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
} from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

import { getAllOrders, Orders } from "@/app/actions/siteadmin/orders"

export default function OrdersChart() {
    const [chartData, setChartData] = useState<
        { status: Orders["status"]; count: number; fill: string }[]
    >([])

    useEffect(() => {
        const fetchData = async () => {
            const orders = await getAllOrders()

            const statusMap: Record<Orders["status"], number> = {
                received: 0,
                preparing: 0,
                packing: 0,
                shipped: 0,
                delivered: 0,
            }

            orders.forEach((order) => {
                statusMap[order.status]++
            })

            const statusColors: Record<Orders["status"], string> = {
                received: "hsl(var(--chart-1))",
                preparing: "hsl(var(--chart-2))",
                packing: "hsl(var(--chart-3))",
                shipped: "hsl(var(--chart-4))",
                delivered: "hsl(var(--chart-5))",
            }

            const formatted = Object.entries(statusMap).map(([status, count]) => ({
                status: status as Orders["status"],
                count,
                fill: statusColors[status as Orders["status"]],
            }))

            setChartData(formatted)
        }

        fetchData()
    }, [])

    const chartConfig = {
        received: { label: "Received", fill: "var(--chart-1)" },
        preparing: { label: "Preparing", fill: "var(--chart-2)" },
        packing: { label: "Packing", fill: "var(--chart-3))" },
        shipped: { label: "Shipped", fill: "var(--chart-4)" },
        delivered: { label: "Delivered", fill: "var(--chart-5)" },
    }

    return (
        <Card className="w-full p-6 ">
            <CardHeader>
                <CardTitle>Orders by Status</CardTitle>
                <CardDescription>Distribution of current order statuses</CardDescription>
            </CardHeader>
            <CardContent className="w-full h-full flex items-center justify-center">
                <ChartContainer config={chartConfig}>
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ left: 0 }}
                    >
                        <YAxis
                            dataKey="status"
                            type="category"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(val) => chartConfig[val as Orders["status"]]?.label}
                        />
                        <XAxis dataKey="count" type="number" hide />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Bar dataKey="count" layout="vertical" radius={5} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 font-medium leading-none">
                    Status overview <TrendingUp className="h-4 w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                    Based on all current orders
                </div>
            </CardFooter>
        </Card>
    )
}