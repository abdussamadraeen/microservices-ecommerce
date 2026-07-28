"use client";

import { useQuery } from "@tanstack/react-query";
import { Search, Loader2, X, Package, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useDebounce } from "use-debounce";
import Link from "next/link";
import Image from "next/image";

export default function AdminSearch() {
    const [query, setQuery] = useState("");
    const [debouncedQuery] = useDebounce(query, 500);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Search Products
    const { data: products = [], isLoading: loadingProducts } = useQuery({
        queryKey: ["admin-search-products", debouncedQuery],
        queryFn: async () => {
            if (!debouncedQuery) return [];
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/products?search=${debouncedQuery}`
            );
            if (!res.ok) return [];
            const data = await res.json();
            return Array.isArray(data) ? data : data.products || [];
        },
        enabled: debouncedQuery.length > 2,
    });

    // Search Orders (Simulated by ID or checking if query looks like ID)
    // Since we don't know exact API for order search, we'll try simulated approach or basic fetch
    const { data: orders = [], isLoading: loadingOrders } = useQuery({
        queryKey: ["admin-search-orders", debouncedQuery],
        queryFn: async () => {
            if (!debouncedQuery) return [];
            // Try searching by ID if it looks like one, or general search
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_ORDER_SERVICE_URL}/orders?search=${debouncedQuery}`
            );
            if (!res.ok) return [];
            const data = await res.json();
            return Array.isArray(data) ? data : data.orders || [];
        },
        enabled: debouncedQuery.length > 2,
    });

    const isLoading = loadingProducts || loadingOrders;
    const hasResults = products.length > 0 || orders.length > 0;

    useEffect(() => {
        if (debouncedQuery.length > 2) setIsOpen(true);
        else setIsOpen(false);
    }, [debouncedQuery]);

    return (
        <div ref={wrapperRef} className="relative w-full max-w-md hidden md:block">
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search products or orders..."
                    className="w-full bg-gray-100 dark:bg-slate-900 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => {
                        if (debouncedQuery.length > 2) setIsOpen(true);
                    }}
                />
                {query && (
                    <button
                        onClick={() => setQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-950 rounded-xl shadow-xl border border-gray-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    {isLoading ? (
                        <div className="p-8 flex flex-col items-center justify-center text-muted-foreground">
                            <Loader2 className="h-6 w-6 animate-spin mb-2" />
                            <p className="text-xs">Searching galactic archives...</p>
                        </div>
                    ) : hasResults ? (
                        <div className="max-h-[60vh] overflow-y-auto py-2">
                            {/* Products Section */}
                            {products.length > 0 && (
                                <div className="px-2">
                                    <div className="text-xs font-semibold text-muted-foreground px-2 py-1.5 uppercase tracking-wider flex items-center gap-2">
                                        <Package className="w-3 h-3" /> Products
                                    </div>
                                    {products.slice(0, 5).map((product: any) => (
                                        <Link
                                            key={product.id || product._id}
                                            href={`/products/${product.id || product._id}/edit`}
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-slate-900 rounded-lg transition-colors group"
                                        >
                                            <div className="h-8 w-8 rounded-md bg-gray-100 dark:bg-slate-800 relative overflow-hidden border">
                                                {product.images && (Object.values(product.images).flat()[0] as string) ? (
                                                    <Image
                                                        src={Object.values(product.images).flat()[0] as string}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <Package className="w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 transition-colors">
                                                    {product.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Stock: {product.inventory}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {products.length > 0 && orders.length > 0 && <div className="h-px bg-gray-100 dark:bg-slate-800 my-2" />}

                            {/* Orders Section */}
                            {orders.length > 0 && (
                                <div className="px-2">
                                    <div className="text-xs font-semibold text-muted-foreground px-2 py-1.5 uppercase tracking-wider flex items-center gap-2">
                                        <ShoppingBag className="w-3 h-3" /> Orders
                                    </div>
                                    {orders.slice(0, 5).map((order: any) => (
                                        <Link
                                            key={order._id}
                                            href={`/orders/${order._id}`}
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-slate-900 rounded-lg transition-colors"
                                        >
                                            <div className="h-8 w-8 rounded-md bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center border border-blue-100 dark:border-blue-800/50">
                                                <ShoppingBag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    Order #{order._id.slice(-6).toUpperCase()}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {order.status} • {new Date(order.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-muted-foreground">
                            <p className="text-sm">No results found.</p>
                            <p className="text-xs mt-1 opacity-70">Try searching for product names or order IDs.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
