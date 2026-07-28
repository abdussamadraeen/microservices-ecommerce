"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ArrowLeft,
    Box,
    Calendar,
    CreditCard,
    MapPin,
    Package,
    Phone,
    Printer,
    Truck,
    User,
    XCircle,
    CheckCircle2,
    Clock,
    AlertOctagon
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { use } from "react";
import { toast } from "react-toastify";
import Image from "next/image";

const OrderDetailsPage = ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = use(params);
    const { getToken } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();

    // Determine back link based on source param
    const backLink = searchParams?.get("source") === "inbox" ? "/inbox" : "/orders";

    const { data: order, isLoading } = useQuery({
        queryKey: ["order", id],
        queryFn: async () => {
            const token = await getToken();
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_ORDER_SERVICE_URL}/orders/${id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (!res.ok) throw new Error("Failed to fetch order");
            return res.json();
        },
    });

    const mutation = useMutation({
        mutationFn: async (newStatus: string) => {
            const token = await getToken();
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_ORDER_SERVICE_URL}/orders/${id}/status`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ status: newStatus }),
                }
            );
            if (!res.ok) throw new Error("Failed to update status");
            return res.json();
        },
        onSuccess: (_, newStatus) => {
            queryClient.invalidateQueries({ queryKey: ["order", id] });
            queryClient.invalidateQueries({ queryKey: ["orders"] }); // Refresh list
            toast.success(`Order marked as ${newStatus}`);
        },
        onError: () => {
            toast.error("Failed to update order status");
        },
    });

    if (isLoading) return <div className="p-8 text-center">Loading Order Details...</div>;
    if (!order) return <div className="p-8 text-center text-red-500">Order not found</div>;

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
            case "success": return "bg-blue-100 text-blue-700 border-blue-200"; // Paid
            case "processing": return "bg-purple-100 text-purple-700 border-purple-200";
            case "shipped": return "bg-indigo-100 text-indigo-700 border-indigo-200";
            case "delivered": return "bg-green-100 text-green-700 border-green-200";
            case "failed": return "bg-red-100 text-red-700 border-red-200";
            case "cancelled": return "bg-gray-100 text-gray-700 border-gray-200";
            default: return "bg-gray-100 text-gray-600";
        }
    };

    const steps = [
        { label: "Order Placed", status: "success", icon: CheckCircle2 }, // Assuming paid = placed for this flow
        { label: "Processing", status: "processing", icon: Package },
        { label: "Shipped", status: "shipped", icon: Truck },
        { label: "Delivered", status: "delivered", icon: MapPin },
    ];

    /* Simple logic to determine active step based on status index */
    const statusOrder = ["pending", "success", "processing", "shipped", "delivered"];
    const currentStepIndex = statusOrder.indexOf(order.status);

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href={backLink} className="p-2 hover:bg-secondary rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold">Order #{order._id.slice(-6).toUpperCase()}</h1>
                            <span className={`px-2.5 py-0.5 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                                {order.status.toUpperCase()}
                            </span>
                        </div>
                        <p className="text-muted-foreground text-sm mt-1">
                            Placed on {new Date(order.createdAt).toLocaleString()}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {order.status !== "cancelled" && order.status !== "delivered" && (
                        <>
                            <button
                                onClick={() => mutation.mutate("cancelled")}
                                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg flex items-center gap-2 border border-red-200 transition-all"
                            >
                                <XCircle className="w-4 h-4" />
                                Cancel Order
                            </button>
                        </>
                    )}

                    {order.status === "success" && (
                        <button
                            onClick={() => mutation.mutate("shipped")}
                            className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg flex items-center gap-2 border border-indigo-200 transition-all shadow-sm"
                        >
                            <Truck className="w-4 h-4" />
                            Mark as Shipped
                        </button>
                    )}

                    {order.status === "shipped" && (
                        <button
                            onClick={() => mutation.mutate("delivered")}
                            className="px-4 py-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg flex items-center gap-2 border border-green-200 transition-all shadow-sm"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Mark Delivered
                        </button>
                    )}

                    <button
                        onClick={() => window.open(`/invoice/${id}`, '_blank')}
                        className="px-4 py-2 text-sm font-medium bg-secondary hover:bg-secondary/80 rounded-lg flex items-center gap-2 transition-all"
                    >
                        <Printer className="w-4 h-4" />
                        Print Invoice
                    </button>
                </div>
            </div>

            {/* Progress / Tracking Bar (Visualizing User Request: "product location/shipped or not") */}
            {order.status !== "cancelled" && order.status !== "failed" && (
                <div className="bg-white dark:bg-slate-950 border rounded-xl p-6 shadow-sm">
                    <h2 className="text-sm font-semibold uppercase text-muted-foreground mb-6 tracking-wider">Order Status</h2>
                    <div className="relative flex items-center justify-between w-full max-w-4xl mx-auto">
                        {/* Connector Line */}
                        <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-100 dark:bg-gray-800 -z-10" />
                        <div
                            className="absolute left-0 top-1/2 h-1 bg-green-500 transition-all duration-500 -z-10"
                            style={{ width: `${Math.max(0, (currentStepIndex - 1) / (steps.length - 1) * 100)}%` }} // Rough progress calc
                        />

                        {steps.map((step, i) => {
                            // Logic: if current status index >= step index, it's completed or active
                            // But "success" is index 1 in my array, "shipped" index 3. 
                            // Map order status to specific steps: 
                            // Placed (success) -> Processing -> Shipped -> Delivered

                            let isActive = false;
                            let isCompleted = false;

                            if (order.status === "success") { isCompleted = i <= 0; isActive = i === 0; }
                            if (order.status === "processing") { isCompleted = i <= 1; isActive = i === 1; }
                            if (order.status === "shipped") { isCompleted = i <= 2; isActive = i === 2; }
                            if (order.status === "delivered") { isCompleted = i <= 3; isActive = i === 3; }

                            return (
                                <div key={step.label} className="flex flex-col items-center gap-3 bg-white dark:bg-slate-950 px-2">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${isActive || isCompleted
                                        ? "bg-green-500 border-green-500 text-white"
                                        : "bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 text-gray-400"
                                        }`}>
                                        <step.icon className="w-5 h-5" />
                                    </div>
                                    <span className={`text-xs font-semibold ${isActive || isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                                        {step.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    {order.status === 'shipped' && (
                        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg flex items-start gap-3 w-full max-w-2xl mx-auto">
                            <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-blue-900 dark:text-blue-300">In Transit</h4>
                                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                                    Product is on the way to the customer. Estimated delivery in 3-5 business days.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Col: Items */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-950 border rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b">
                            <h2 className="font-semibold text-lg flex items-center gap-2">
                                <Package className="w-5 h-5 text-primary" />
                                Order Items
                            </h2>
                        </div>
                        <div className="divide-y">
                            {order.products.map((item: any, i: number) => (
                                <div key={i} className="p-6 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                    {/* Product Image */}
                                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center shrink-0 border overflow-hidden relative">
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <Package className="w-8 h-8 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-base">{item.name}</h3>
                                        <div className="text-sm text-muted-foreground mt-1 space-y-1">
                                            {item.selectedSize && <p>Size: <span className="text-foreground font-medium">{item.selectedSize}</span></p>}
                                            {item.selectedColor && <p>Color: <span className="text-foreground font-medium flex items-center gap-1.5"><span className="w-2 h-2 rounded-full inline-block border" style={{ backgroundColor: item.selectedColor }}></span>{item.selectedColor}</span></p>}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">₹{item.price.toLocaleString("en-IN")}</p>
                                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                        <p className="font-bold mt-1 text-primary">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                                    </div>
                                </div>
                            ))}
                            <div className="p-6 bg-gray-50/50 dark:bg-slate-900/50">
                                <div className="flex justify-between items-center text-sm mb-2">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>₹{(order.amount / 100).toLocaleString("en-IN")}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm mb-2">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span className="text-green-600 font-medium">Free</span>
                                </div>
                                <div className="flex justify-between items-center text-lg font-bold mt-4 pt-4 border-t">
                                    <span>Total</span>
                                    <span>₹{(order.amount / 100).toLocaleString("en-IN")}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Col: Customer Info */}
                <div className="space-y-6">
                    {/* Customer */}
                    <div className="bg-white dark:bg-slate-950 border rounded-xl p-6 shadow-sm">
                        <h2 className="font-semibold mb-4 flex items-center gap-2 text-sm uppercase text-muted-foreground tracking-wider">
                            <User className="w-4 h-4" /> Customer Details
                        </h2>
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                {order.shippingAddress.name?.charAt(0) || "U"}
                            </div>
                            <div>
                                <p className="font-semibold">{order.shippingAddress.name}</p>
                                <p className="text-sm text-muted-foreground">Customer</p>
                            </div>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-3">
                                <CreditCard className="w-4 h-4 text-gray-400" />
                                <span>{order.email}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span>{order.shippingAddress.phone || "No phone"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping */}
                    <div className="bg-white dark:bg-slate-950 border rounded-xl p-6 shadow-sm">
                        <h2 className="font-semibold mb-4 flex items-center gap-2 text-sm uppercase text-muted-foreground tracking-wider">
                            <MapPin className="w-4 h-4" /> Shipping Address
                        </h2>
                        <address className="not-italic text-sm text-foreground/80 leading-relaxed">
                            {order.shippingAddress.address}<br />
                            {order.shippingAddress.city}<br />
                        </address>
                    </div>

                    {/* Payment */}
                    <div className="bg-white dark:bg-slate-950 border rounded-xl p-6 shadow-sm">
                        <h2 className="font-semibold mb-4 flex items-center gap-2 text-sm uppercase text-muted-foreground tracking-wider">
                            <CreditCard className="w-4 h-4" /> Payment Info
                        </h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Method</span>
                                <span className="font-medium capitalize">{order.paymentMethod || "Card"}</span>
                            </div>

                            <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground">Transaction ID</span>
                                <span
                                    className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded break-all"
                                    title={order.paymentId || ""}
                                >
                                    {order.paymentId || "-"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Date</span>
                                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsPage;
