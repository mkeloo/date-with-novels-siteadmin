"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrdersChart from "./OrdersChart";

export default function SalesAnalyticsPage() {
    const [tab, setTab] = useState("orders");

    return (
        <div className="flex h-[80vh]">
            {/* Sidebar Tabs (25%) */}
            <div className="w-[20%] border-r px-4 py-6 flex flex-col items-center">
                <h2 className="text-2xl font-semibold mb-6">Analytics</h2>
                <Tabs value={tab} onValueChange={setTab} orientation="vertical">
                    <TabsList className="flex flex-col gap-3 bg-muted py-2 rounded-lg px-4">
                        {["orders", "customers", "transactions", "packages", "geoChart"].map((key) => (
                            <TabsTrigger
                                key={key}
                                value={key}
                                className="w-full px-8 py-2.5 text-lg font-medium justify-center"
                            >
                                {key.charAt(0).toUpperCase() + key.slice(1)}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            {/* Chart Area (75%) */}
            <div className="w-[80%] px-6 py-6">
                {tab === "orders" && <OrdersChart />}
                {tab === "customers" && <h1 className="text-2xl font-bold">Customer Insights</h1>}
                {tab === "transactions" && <h1 className="text-2xl font-bold">Transaction Trends</h1>}
                {tab === "packages" && <h1 className="text-2xl font-bold">Packages Trends</h1>}
                {tab === "geoChart" && <h1 className="text-2xl font-bold">GeoChart Trends</h1>}
            </div>
        </div>
    );
}