"use client";

import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { Package, ShoppingBag, Calendar, AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { useCurrency } from "@/context/CurrencyContext";

interface UserOrdersProps {
    userId: string;
    limit?: number;
    compact?: boolean;
}

const OrderItem = ({ item }: { item: any }) => {
    const { formatPrice } = useCurrency();

    // Fetch product details to get the real image
    const { data: product } = useQuery({
        queryKey: ["product", item.id],
        queryFn: async () => {
            if (!item.id) return null;
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/products/${item.id}`);
                if (!res.ok) return null;
                return res.json();
            } catch (e) {
                return null;
            }
        },
        enabled: !!item.id,
        staleTime: 1000 * 60 * 5, // Cache for 5 mins
    });

    // Determine Image
    let imageUrl = item.image; // Fallback to item.image if stored in order
    if (product && product.images) {
        // Try to match selected color logic from schema
        if (item.selectedColor && product.images[item.selectedColor]) {
            imageUrl = product.images[item.selectedColor];
        } else {
            // Default to first available image
            const values = Object.values(product.images);
            if (values.length > 0) imageUrl = values[0] as string;
        }
    }

    // Strict validation to prevent "empty string" error in next/image
    const hasValidImage = typeof imageUrl === "string" && imageUrl.trim().length > 0;

    return (
        <div className="flex gap-3 items-start py-2">
            <div className="w-12 h-12 rounded-md bg-muted border flex items-center justify-center shrink-0 overflow-hidden relative">
                {hasValidImage ? (
                    <Image
                        src={imageUrl}
                        alt={item.name || "Product Image"}
                        fill
                        className="object-cover"
                        sizes="48px"
                    />
                ) : (
                    <ShoppingBag className="w-5 h-5 text-muted-foreground/40" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate leading-tight">{item.name || "Product Item"}</p>
                <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                    <span>Qty: {item.quantity}</span>
                    {item.selectedColor && (
                        <span className="flex items-center gap-1">
                            • <span className="capitalize">{item.selectedColor}</span>
                            <span
                                className="w-2 h-2 rounded-full border border-black/10"
                                style={{ backgroundColor: item.selectedColor }}
                            />
                        </span>
                    )}
                    {item.selectedSize && <span>• Size: {item.selectedSize}</span>}
                </div>
            </div>
            <div className="text-sm font-semibold tabular-nums">
                {formatPrice(item.price || 0)}
            </div>
        </div>
    );
};

const UserOrders = ({ userId, limit, compact = false }: UserOrdersProps) => {
    const { getToken } = useAuth();
    const { formatPrice } = useCurrency();

    const { data: orders, isLoading, isError } = useQuery({
        queryKey: ["user-orders", userId],
        queryFn: async () => {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_ORDER_SERVICE_URL}/orders`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch orders");
            const allOrders = await res.json();
            const userOrders = allOrders.filter((order: any) => order.userId === userId);
            return userOrders.reverse();
        },
        enabled: !!userId,
    });

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-destructive/80">
                <AlertCircle className="w-8 h-8 mb-2" />
                <p>Failed to load order history.</p>
            </div>
        );
    }

    if (!orders || orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/20 rounded-xl border-dashed border-2">
                <Package className="w-10 h-10 mb-3 opacity-40" />
                <p>No orders found for this user.</p>
            </div>
        );
    }

    const displayOrders = limit ? orders.slice(0, limit) : orders;

    return (
        <div className={`space-y-4 ${compact ? "" : "grid grid-cols-1 gap-4"}`}>
            {displayOrders.map((order: any) => {
                // Handle both 'products' (from schema) and 'items' (legacy/fallback)
                const items = order.products || order.items || [];

                return (
                    <div
                        key={order.id || order._id}
                        className={`group bg-card hover:bg-accent/5 transition-colors border rounded-xl overflow-hidden ${compact ? "p-4" : "p-6 shadow-sm"
                            }`}
                    >
                        {/* Order Header */}
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="font-mono text-xs text-muted-foreground">Order #{order.id?.toString().slice(-6).toUpperCase() || "ID"}</span>
                                    <Badge
                                        variant={
                                            order.status === "success" || order.status === "delivered"
                                                ? "default"
                                                : order.status === "pending" || order.status === "processing"
                                                    ? "secondary"
                                                    : "destructive"
                                        }
                                        className={`text-[10px] capitalize px-2 py-0.5 border-0 ${order.status === "success" || order.status === "delivered" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                            order.status === "pending" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                                                order.status === "processing" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : ""
                                            }`}
                                    >
                                        {order.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>
                                        {order.createdAt
                                            ? format(new Date(order.createdAt), "MMM d, yyyy • h:mm a")
                                            : "Date N/A"}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block font-bold text-lg text-primary tracking-tight">
                                    {formatPrice((order.amount || 0) / 100)}
                                </span>
                            </div>
                        </div>

                        <Separator className="mb-2" />

                        {/* Order Items */}
                        {items.length > 0 ? (
                            <div className="space-y-1">
                                {items.map((item: any, idx: number) => (
                                    <OrderItem key={idx} item={item} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-2 text-xs text-muted-foreground italic bg-muted/20 rounded">
                                No items details available
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default UserOrders;
