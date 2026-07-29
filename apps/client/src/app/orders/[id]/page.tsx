import { getOrderById } from "@/lib/order";
import { ArrowLeft, CheckCircle2, Clock, Truck, Package, MapPin, CreditCard, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const steps = [
    { status: "processing", label: "Order Placed", icon: Clock },
    { status: "confirmed", label: "Confirmed", icon: CheckCircle2 },
    { status: "shipped", label: "Shipped", icon: Truck },
    { status: "delivered", label: "Delivered", icon: Package },
];

const OrderDetailsPage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = (await params);

    // Server Action call
    const order = await getOrderById(id);

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
                <p className="text-gray-500 mb-6">We couldn't locate the order you're looking for.</p>
                <Link href="/orders" className="text-blue-600 hover:underline flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Orders
                </Link>
            </div>
        );
    }

    // Determine current step index
    const getStepIndex = (status: string) => {
        const s = status.toLowerCase();
        if (s === "shipped") return 2;
        if (s === "delivered") return 3;
        if (s === "confirmed") return 1;
        return 0; // Default to placed/processing
    };

    const currentStep = getStepIndex(order.status);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Navigation */}
                <Link href="/orders" className="flex items-center text-gray-500 hover:text-gray-900 transition-colors w-fit">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Orders
                </Link>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

                    {/* Header */}
                    <div className="bg-gray-900 text-white p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Order ID</p>
                                <h1 className="text-2xl font-mono">{order._id.slice(-8).toUpperCase()}</h1>
                                <p className="text-sm text-gray-400 mt-2">
                                    Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                        day: "numeric", month: "long", year: "numeric"
                                    })}
                                </p>
                            </div>
                            <div className="text-right">
                                <Link
                                    href={`/invoice/${order._id}`}
                                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    <ShoppingBag className="w-4 h-4" />
                                    Download Invoice
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Tracking Stepper */}
                    <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                        <div className="relative">
                            {/* Progress Bar Background */}
                            <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 rounded-full" />

                            {/* Active Progress Bar */}
                            <div
                                className="absolute top-5 left-0 h-1 bg-green-500 rounded-full transition-all duration-1000"
                                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                            />

                            <div className="relative flex justify-between">
                                {steps.map((step, index) => {
                                    const Icon = step.icon;
                                    const isActive = index <= currentStep;

                                    return (
                                        <div key={step.status} className="flex flex-col items-center gap-3">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500 z-10 
                                        ${isActive
                                                        ? "bg-green-500 border-green-500 text-white scale-110 shadow-lg shadow-green-200"
                                                        : "bg-white border-gray-200 text-gray-300"
                                                    }`}
                                            >
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="text-center">
                                                <p className={`text-xs font-bold uppercase tracking-wider ${isActive ? "text-green-600" : "text-gray-400"}`}>
                                                    {step.label}
                                                </p>
                                                {isActive && index === currentStep && (
                                                    <p className="text-[10px] text-gray-500 mt-0.5 animate-pulse">
                                                        Current Status
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
                        {/* Order Items */}
                        <div className="md:col-span-2 space-y-6">
                            <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Items</h2>
                            {order.products.map((item: any, i: number) => (
                                <div key={i} className="flex gap-4 items-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Package className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                                        <div className="text-sm text-gray-500 mt-1 space-x-3">
                                            <span>Qty: {item.quantity}</span>
                                            <span>•</span>
                                            <span>₹{(item.price).toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            ))}

                            <div className="pt-4 border-t mt-4 space-y-2">
                                <div className="flex justify-between text-gray-500">
                                    <span>Subtotal</span>
                                    <span>₹{((order.amount || 0) / 100).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>Shipping</span>
                                    <span className="text-green-600">Free</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                                    <span>Total</span>
                                    <span>₹{((order.amount || 0) / 100).toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Details */}
                        <div className="space-y-8">
                            {/* Shipping Address */}
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Shipping</h2>
                                {order.shippingAddress ? (
                                    <div className="flex gap-3">
                                        <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p className="font-medium text-gray-900">{order.shippingAddress.name}</p>
                                            <p>{order.shippingAddress.address}</p>
                                            <p>{order.shippingAddress.city}</p>
                                            <p>{order.shippingAddress.phone}</p>
                                            <p>{order.shippingAddress.email}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">No address provided</p>
                                )}
                            </div>

                            {/* Payment Info */}
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Payment</h2>
                                <div className="flex gap-3">
                                    <CreditCard className="w-5 h-5 text-gray-400 mt-1" />
                                    <div className="text-sm text-gray-600">
                                        <p className="font-medium text-gray-900 capitalize">{order.paymentMethod || "Online"}</p>
                                        <p className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full inline-block mt-2 font-medium">
                                            PAID
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsPage;
