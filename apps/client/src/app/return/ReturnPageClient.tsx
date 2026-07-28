"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useCartStore from "@/stores/cartStore";
import { useAuth } from "@clerk/nextjs";
import { CheckCircle2, XCircle, ArrowRight, Terminal } from "lucide-react";
import { MiLoader } from "@/components/MiLoader";
import Link from "next/link";
// import Confetti from "react-dom-confetti"; // Commented out to avoid dependency error if not installed, replaced with CSS animation
import { createOrder } from "@/actions/order";



const ReturnPageClient = ({
    sessionId,
    paymentStatus,
    amountTotal,
}: {
    sessionId: string;
    paymentStatus: string;
    amountTotal: number; // In cents
}) => {
    const { cart, clearCart } = useCartStore();
    const { getToken } = useAuth();
    const router = useRouter();
    const [status, setStatus] = useState<"processing" | "success" | "failed">("processing");
    const [logs, setLogs] = useState<string[]>(["Initializing order sequence..."]);
    const hasRun = useRef(false);

    // Simple Confetti Effect using CSS
    const Confetti = () => (
        <div className="pointer-events-none absolute inset-0 overflow-hidden flex justify-center">
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
            <div className="confetti-piece"></div>
        </div>
    );

    const addLog = (msg: string) => {
        setLogs(prev => [...prev, msg]);
    };

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        const processOrder = async () => {
            if (paymentStatus !== "paid" && paymentStatus !== "complete") {
                setStatus("failed");
                addLog("Error: Payment verification failed.");
                return;
            }

            try {
                addLog("Payment verified. Fetching shipping details...");

                // Retrieve shipping details from localStorage
                const shippingFormStr = localStorage.getItem("temp_shipping_form");

                const shippingForm = shippingFormStr ? JSON.parse(shippingFormStr) : {
                    name: "Valued Customer",
                    email: "secure@checkout.com",
                    phone: "",
                    address: "Address Not Provided",
                    city: ""
                };

                if (!shippingFormStr) {
                    addLog("Warning: Cached shipping address missing. Using defaults.");
                } else {
                    addLog(`Shipping to: ${shippingForm.city}`);
                }

                addLog("Connecting to Order Service...");

                const token = await getToken();

                // Construct Order Data
                let items = cart.length > 0 ? cart : [];

                // Fallback: Try to recover from localStorage if store is empty (likely due to refresh)
                if (items.length === 0) {
                    const backupCart = localStorage.getItem("temp_cart_backup");
                    if (backupCart) {
                        try {
                            items = JSON.parse(backupCart);
                            addLog("Restored items from local backup.");
                        } catch (e) {
                            addLog("Error restoring backup cart.");
                        }
                    }
                }

                if (items.length === 0) {
                    addLog("Warning: Local cart is empty. Order may lack product details.");
                }

                const result = await createOrder({
                    products: items.map((item) => ({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        selectedSize: item.selectedSize,
                        selectedColor: item.selectedColor,
                    })),
                    amount: amountTotal,
                    shippingAddress: {
                        name: shippingForm.name,
                        email: shippingForm.email,
                        phone: shippingForm.phone,
                        address: shippingForm.address,
                        city: shippingForm.city,
                    },
                    paymentMethod: "stripe",
                    paymentId: sessionId,
                    status: "success",
                });

                if (!result.success) {
                    throw new Error(`Order service rejected request: ${result.error}`);
                }

                addLog("Order successfully recorded in database.");
                addLog("Clearing local cart cache...");

                clearCart();
                localStorage.removeItem("temp_shipping_form");
                localStorage.removeItem("temp_cart_backup");

                addLog("Finalizing...");

                // Artificial delay for effect
                setTimeout(() => {
                    setStatus("success");
                    addLog("Done.");
                }, 800);

            } catch (error) {
                console.error("Order creation error:", error);
                addLog(`Critical Error: ${error instanceof Error ? error.message : "Unknown error"}`);
                setStatus("failed");
            }
        };

        // Start with a small delay for visual effect
        setTimeout(processOrder, 1000);
    }, [paymentStatus, cart, clearCart, getToken, sessionId, amountTotal]);

    if (status === "processing") {
        return (
            <div className="min-h-screen bg-white/50 backdrop-blur-3xl flex flex-col items-center justify-center p-4">
                <div className="flex flex-col items-center gap-8 animate-in fade-in duration-700">
                    <MiLoader />

                    <div className="text-center space-y-3">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Processing Order</h2>
                        <div className="h-6 flex items-center justify-center overflow-hidden">
                            <p className="text-gray-500 font-medium animate-pulse">
                                {logs[logs.length - 1] || "Please wait..."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (status === "failed") {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Creation Failed</h1>
                    <p className="text-gray-500 mb-6">
                        Your payment was successful, but we couldn't create the order record automatically.
                        Please contact support with ID: <span className="font-mono text-xs bg-gray-100 p-1 rounded">{sessionId.slice(-8)}</span>
                    </p>
                    <div className="bg-gray-900 rounded-lg p-4 text-left font-mono text-xs text-red-400 mb-6 overflow-hidden">
                        {logs.slice(-3).map((l, i) => <div key={i}>{">"} {l}</div>)}
                    </div>
                    <Link href="/" className="block w-full bg-black text-white py-3 rounded-xl font-medium">
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 animate-in fade-in duration-500">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden relative">
                <div className="bg-green-50 p-8 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm animate-in zoom-in duration-500">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                    <p className="text-gray-500">Thank you for your purchase.</p>
                </div>

                <div className="p-8 space-y-6">
                    {/* Master Price Display */}
                    <div className="text-center p-6 bg-black rounded-2xl shadow-lg transform hover:scale-[1.02] transition-transform">
                        <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Total Paid</p>
                        <p className="text-4xl font-bold text-white tracking-tight">
                            ₹{(amountTotal / 100).toLocaleString('en-IN')}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                            <span className="text-gray-500">Payment ID</span>
                            <span className="font-mono text-gray-900">{sessionId.slice(-8).toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                            <span className="text-gray-500">Status</span>
                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">PAID</span>
                        </div>
                    </div>

                    <Link
                        href="/orders"
                        className="flex items-center justify-center gap-2 w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
                    >
                        View Your Orders
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ReturnPageClient;
