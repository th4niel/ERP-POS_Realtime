'use client';

import LineCharts from "@/components/common/line-chart";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import LowStockAlert from "./low-stock-alert";
import StockReport from "./stock-report";

export default function Dashboard() {
    const supabase = createClient();
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 6);
    lastWeek.setHours(0,0,0,0);

    const {
        data: orders,
    } = useQuery({
        queryKey: ["orders-per-day"],
        queryFn: async () => {
            const {data} = await supabase
                .from("orders")
                .select('created_at')
                .gte('created_at', lastWeek.toISOString())
                .order('created_at');

            const counts: Record<string, number> = {};

            (data??[]).forEach((order) => {
                const date = new Date(order.created_at).toISOString().slice(0, 10);
                counts[date] = (counts[date] || 0) + 1;
            });

            return Object.entries(counts).map(([name, total]) => ({name, total}));
        },
    });

    const { data: stats } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const [ordersResult, itemsResult, itemsData] = await Promise.all([
                supabase.from('orders').select('id', { count: 'exact', head: true }),
                supabase.from('inventory_items').select('id', { count: 'exact', head: true }),
                supabase.from('inventory_items').select('current_stock, minimum_stock')
            ]);

            const lowStockCount = (itemsData.data || []).filter(
                item => item.current_stock <= item.minimum_stock
            ).length;

            return {
                totalOrders: ordersResult.count || 0,
                totalItems: itemsResult.count || 0,
                lowStockCount,
            };
        },
    });

    return (
        <div className="w-full space-y-4">
            <div className="flex flex-col lg:flex-row mb-4 gap-2 justify-between w-full">
                <h1 className="text-2xl font-bold">Dashboard</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader>
                        <CardDescription>Total Orders</CardDescription>
                        <CardTitle className="text-3xl">{stats?.totalOrders || 0}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Inventory Items</CardDescription>
                        <CardTitle className="text-3xl">{stats?.totalItems || 0}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Low Stock Items</CardDescription>
                        <CardTitle className="text-3xl text-red-500">{stats?.lowStockCount || 0}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Create Per Week</CardTitle>
                            <CardDescription>
                                Showing orders from {lastWeek.toLocaleDateString()} to{' '} 
                                {new Date().toLocaleDateString()}
                            </CardDescription>
                        </CardHeader>
                        <div className="w-full h-64 p-6">
                            <LineCharts data={orders}/>
                        </div>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <LowStockAlert />
                </div>
            </div>

            <StockReport />
        </div>
    );
}