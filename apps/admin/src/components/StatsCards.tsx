"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, DollarSign, ShoppingBag, Activity } from "lucide-react";

export const StatsCards = () => {
    const { getToken } = useAuth();

    const { data: statusData = [] } = useQuery({
        queryKey: ["order-status-stats"],
        queryFn: async () => {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_ORDER_SERVICE_URL}/analytics/order-status`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) return [];
            return res.json();
        }
    });

    const { data: revenueData } = useQuery({
        queryKey: ["revenue-analytics"],
        queryFn: async () => {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_ORDER_SERVICE_URL}/analytics/revenue`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) return { totalRevenue: 0 };
            return res.json();
        }
    });

    // Calculate metrics
    const totalOrders = statusData.reduce((acc: number, curr: any) => acc + curr.count, 0);
    const successOrders = statusData.find((s: any) => s.status.toLowerCase() === "success")?.count || 0;
    const totalRevenue = revenueData?.totalRevenue || 0;

    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const conversionRate = totalOrders > 0 ? (successOrders / totalOrders) * 100 : 0;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
            <Card className="glass-panel border-white/5 bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-indigo-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString("en-IN")}</div>
                    <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
            </Card>
            <Card className="glass-panel border-white/5 bg-gradient-to-br from-emerald-500/10 to-teal-500/10">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Orders</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalOrders}</div>
                    <p className="text-xs text-muted-foreground">+180.1% from last month</p>
                </CardContent>
            </Card>
            <Card className="glass-panel border-white/5 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
                    <CreditCard className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹{Math.round(averageOrderValue).toLocaleString("en-IN")}</div>
                    <p className="text-xs text-muted-foreground">+19% from last month</p>
                </CardContent>
            </Card>
            <Card className="glass-panel border-white/5 bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                    <Activity className="h-4 w-4 text-cyan-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">+201 since last hour</p>
                </CardContent>
            </Card>
        </div>
    );
};
