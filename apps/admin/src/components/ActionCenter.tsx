"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, Package, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";

const ActionCenter = () => {
    const { getToken } = useAuth();

    // 1. Fetch Pending Orders Count
    const { data: pendingOrders = [] } = useQuery({
        queryKey: ["pending-orders"],
        queryFn: async () => {
            const token = await getToken();
            if (!token) return [];
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_ORDER_SERVICE_URL}/orders?status=pending`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!res.ok) return [];
            return res.json();
        },
        refetchInterval: 30000,
    });

    // 2. Fetch Low Stock Products Count
    const { data: lowStockProducts = [] } = useQuery({
        queryKey: ["low-stock-products"],
        queryFn: async () => {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/products?lowStock=true&limit=5`
            );
            if (!res.ok) return [];
            return res.json();
        },
        refetchInterval: 60000,
    });

    const pendingCount = pendingOrders.length;
    const lowStockCount = lowStockProducts.length;
    const hasAlerts = pendingCount > 0 || lowStockCount > 0;

    return (
        <Card className="h-full border-border bg-card shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b bg-muted/20">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        Store Health
                        {hasAlerts && (
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                            </span>
                        )}
                    </CardTitle>
                    <Badge variant={hasAlerts ? "outline" : "secondary"} className="font-mono text-[10px] uppercase tracking-wider">
                        {hasAlerts ? "Attention Needed" : "System Normal"}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <ScrollArea className="h-[350px]">
                    <div className="p-4 space-y-4">

                        {/* HEALTH STATUS INDICATOR */}
                        {!hasAlerts && (
                            <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 border-2 border-dashed rounded-xl border-muted">
                                <div className="h-14 w-14 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                    <CheckCircle2 className="h-7 w-7 text-green-600 dark:text-green-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">All Systems Healthy</h3>
                                    <p className="text-sm text-muted-foreground mt-1">No pending orders or inventory alerts.</p>
                                </div>
                            </div>
                        )}

                        {/* ACTION CARDS */}
                        {hasAlerts && (
                            <div className="grid gap-3">
                                {/* PENDING ORDERS CARD */}
                                <Link href="/orders?status=pending" className="block">
                                    <div className={`
                                        group relative overflow-hidden rounded-xl border p-4 transition-all duration-200
                                        ${pendingCount > 0
                                            ? 'bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-900 hover:border-red-400 dark:hover:border-red-700'
                                            : 'bg-card border-border opacity-60 grayscale'
                                        }
                                    `}>
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2.5 rounded-lg ${pendingCount > 0 ? 'bg-red-100/80 dark:bg-red-900/40 text-red-600 dark:text-red-400' : 'bg-muted text-muted-foreground'}`}>
                                                    <ShoppingBag className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                                                    <h4 className={`text-2xl font-bold font-mono tracking-tight ${pendingCount > 0 ? 'text-red-700 dark:text-red-400' : 'text-foreground'}`}>
                                                        {pendingCount}
                                                    </h4>
                                                </div>
                                            </div>
                                            <ArrowRight className={`h-5 w-5 transition-transform group-hover:translate-x-1 ${pendingCount > 0 ? 'text-red-400 opacity-100' : 'opacity-0'}`} />
                                        </div>
                                        {pendingCount > 0 && (
                                            <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-3 font-medium flex items-center gap-1.5">
                                                <Clock className="h-3.5 w-3.5" />
                                                Requires payment verification
                                            </p>
                                        )}
                                    </div>
                                </Link>

                                {/* LOW STOCK CARD */}
                                <Link href="/products?lowStock=true" className="block">
                                    <div className={`
                                        group relative overflow-hidden rounded-xl border p-4 transition-all duration-200
                                        ${lowStockCount > 0
                                            ? 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900 hover:border-amber-400 dark:hover:border-amber-700'
                                            : 'bg-card border-border opacity-60 grayscale'
                                        }
                                    `}>
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2.5 rounded-lg ${lowStockCount > 0 ? 'bg-amber-100/80 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' : 'bg-muted text-muted-foreground'}`}>
                                                    <AlertTriangle className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">Low Stock Alerts</p>
                                                    <h4 className={`text-2xl font-bold font-mono tracking-tight ${lowStockCount > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-foreground'}`}>
                                                        {lowStockCount}
                                                    </h4>
                                                </div>
                                            </div>
                                            <ArrowRight className={`h-5 w-5 transition-transform group-hover:translate-x-1 ${lowStockCount > 0 ? 'text-amber-400 opacity-100' : 'opacity-0'}`} />
                                        </div>
                                        {lowStockCount > 0 && (
                                            <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-3 font-medium flex items-center gap-1.5">
                                                <Package className="h-3.5 w-3.5" />
                                                Restock recommended
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            </div>
                        )}

                        {/* BOTTOM INFO */}
                        <div className="pt-2">
                            <div className="rounded-lg bg-muted/30 p-3 flex items-start gap-3 border border-dashed border-border">
                                <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">i</span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Usage Tip: Click any alert to open its management page.
                                </p>
                            </div>
                        </div>

                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default ActionCenter;
