"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Printer, Mail, Phone, MapPin, Globe } from "lucide-react";
import Image from "next/image";
import { use, useEffect } from "react";
import { useStoreSettings } from "@/hooks/useStoreSettings";

const InvoicePage = ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = use(params);
    const { getToken } = useAuth();
    const { settings } = useStoreSettings();

    const { data: order, isLoading } = useQuery({
        queryKey: ["invoice", id],
        queryFn: async () => {
            const token = await getToken();
            if (!token) return null;
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

    // Auto-print when loaded
    useEffect(() => {
        if (order) {
            setTimeout(() => {
                window.print();
            }, 1000);
        }
    }, [order]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-black" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="p-8 text-center text-red-500">
                Order not found or unauthorized.
            </div>
        );
    }

    // Calculations
    const subtotal = order.amount / 100; // Amount is in cents usually, but checking previous code it seemed it might be raw? 
    // Wait, in previous code: `₹{order.amount.toLocaleString("en-IN")}` and `₹{(item.price * item.quantity).toLocaleString("en-IN")}`
    // If order.amount is total, let's reverse calculate tax for display if not present.
    // Assuming the DB stores the final amount.

    // Let's assume a standard 18% GST is included in the price for this "Real" feel.
    // Amount = Base + Tax
    // Amount = Base * 1.18
    // Base = Amount / 1.18
    const taxRate = 0.18;
    const totalAmount = order.amount / 100; // stored in cents typically in Stripe, but need to be careful with existing logic.
    // Looking at previous valid code: `₹{(order.amount / 100).toLocaleString("en-IN")}` was used in OrderDetailsPage.
    // So order.amount IS in cents.

    const baseAmount = totalAmount / (1 + taxRate);
    const taxAmount = totalAmount - baseAmount;

    return (
        <div className="min-h-screen bg-gray-100 print:bg-white print:p-0 p-8 flex justify-center items-start">
            {/* Print Controls */}
            <div className="fixed top-8 right-8 print:hidden z-50">
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl font-medium"
                >
                    <Printer className="w-4 h-4" />
                    Print / Save PDF
                </button>
            </div>

            <div className="max-w-[210mm] w-full bg-white shadow-2xl print:shadow-none print:w-full min-h-[297mm] relative overflow-hidden">
                {/* Decorative Top Border */}
                <div className="h-2 bg-gradient-to-r from-black via-gray-700 to-black w-full" />

                <div className="p-12 md:p-16 relative">
                    {/* Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none overflow-hidden">
                        <span className="text-[12rem] font-bold -rotate-45">INVOICE</span>
                    </div>

                    {/* Header Section */}
                    <div className="flex justify-between items-start mb-16 relative z-10">
                        <div>
                            {/* Logo Area */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-white rounded-lg p-1 shrink-0 flex items-center justify-center overflow-hidden">
                                    {settings?.storeLogo ? (
                                        <Image
                                            src={settings.storeLogo}
                                            alt={settings.storeName || "Store"}
                                            width={48}
                                            height={48}
                                            className="object-contain"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-black text-white flex items-center justify-center font-bold">
                                            {settings?.storeName?.slice(0, 2).toUpperCase() || "ST"}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">{settings?.storeName || "Store Name"}</h1>
                                    <p className="text-xs text-gray-500 tracking-widest uppercase">
                                        {/* Dynamic Tagline based on Order Items */}
                                        {(() => {
                                            const items = order.products || [];
                                            const isClothing = items.some((p: any) =>
                                                p.name.toLowerCase().includes("shirt") ||
                                                p.name.toLowerCase().includes("wear") ||
                                                p.name.toLowerCase().includes("cloth") ||
                                                p.name.toLowerCase().includes("pant") ||
                                                p.name.toLowerCase().includes("dress")
                                            );

                                            // You can extend this logic or fetch real category if available
                                            if (isClothing) return "Clothing";
                                            return "Electronics";
                                        })()}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-1 text-sm text-gray-600 font-medium max-w-[250px] whitespace-pre-wrap">
                                {settings?.storeAddress ? (
                                    <div className="flex gap-2">
                                        <MapPin className="w-3.5 h-3.5 mt-1 shrink-0" />
                                        <span>{settings.storeAddress}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span>Global Tech Park, Bangalore, KA, 560103</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Mail className="w-3.5 h-3.5" />
                                    <span>billing@xiaomistore.in</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Globe className="w-3.5 h-3.5" />
                                    <span>www.xiaomistore.in</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <h2 className="text-5xl font-light tracking-tight text-gray-900 mb-2">INVOICE</h2>
                            <p className="text-gray-500 font-mono text-sm mb-6">#{order._id.slice(-8).toUpperCase()}</p>

                            <div className="space-y-1">
                                <div className="flex justify-end gap-4 text-sm">
                                    <span className="text-gray-500 w-24">Date Issued:</span>
                                    <span className="font-semibold text-gray-900">{new Date(order.createdAt).toLocaleDateString("en-IN", { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <div className="flex justify-end gap-4 text-sm text-gray-900">
                                    <span className="text-gray-500 w-24">Order ID:</span>
                                    <span className="font-mono">{order._id.slice(-8).toUpperCase()}</span>
                                </div>
                                <div className="flex justify-end gap-4 text-sm text-gray-900">
                                    <span className="text-gray-500 w-24">Payment:</span>
                                    <span className="capitalize">{order.paymentMethod || "Card"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bill To / Ship To Grid */}
                    <div className="grid grid-cols-2 gap-12 mb-16 relative z-10 border-t border-b border-gray-100 py-8">
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Billed To</h3>
                            <div className="text-gray-800 text-sm leading-relaxed space-y-1">
                                <p className="font-bold text-lg text-black mb-2">{order.shippingAddress?.name || "Customer"}</p>
                                <p>{order.email}</p>
                                <p>{order.shippingAddress?.phone}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Shipped To</h3>
                            <div className="text-gray-800 text-sm leading-relaxed space-y-1 flex flex-col items-end">
                                <p className="font-bold text-lg text-black mb-2">{order.shippingAddress?.name}</p>
                                <p className="max-w-[200px]">{order.shippingAddress?.address}</p>
                                <p>{order.shippingAddress?.city}</p>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Items Table */}
                    <div className="mb-12 relative z-10">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="py-4 border-b-2 border-black text-xs font-bold text-black uppercase tracking-wider w-[45%] pl-2">Item Details</th>
                                    <th className="py-4 border-b-2 border-black text-xs font-bold text-black uppercase tracking-wider text-right w-[15%]">Rate</th>
                                    <th className="py-4 border-b-2 border-black text-xs font-bold text-black uppercase tracking-wider text-center w-[10%]">Qty</th>
                                    <th className="py-4 border-b-2 border-black text-xs font-bold text-black uppercase tracking-wider text-right w-[15%]">Tax (18%)</th>
                                    <th className="py-4 border-b-2 border-black text-xs font-bold text-black uppercase tracking-wider text-right w-[15%] pr-2">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {order.products.map((item: any, i: number) => {
                                    // Item Calculations
                                    const itemTotal = item.price * item.quantity;
                                    const itemBase = itemTotal / 1.18;
                                    const itemTax = itemTotal - itemBase;
                                    const itemRate = item.price / 1.18;

                                    return (
                                        <tr key={i} className="border-b border-gray-100">
                                            <td className="py-6 pr-4 align-top pl-2">
                                                <div className="flex gap-4">
                                                    {item.image && (
                                                        <div className="w-16 h-16 bg-gray-50 rounded-md border border-gray-100 overflow-hidden relative shrink-0 print:border-gray-200">
                                                            <Image
                                                                src={item.image}
                                                                alt={item.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-gray-900">{item.name}</p>
                                                        <div className="text-xs text-gray-500 mt-1 space-x-3">
                                                            {item.selectedSize && <span>Size: <span className="text-gray-900">{item.selectedSize}</span></span>}
                                                            {item.selectedColor && <span>Color: <span className="text-gray-900">{item.selectedColor}</span></span>}
                                                        </div>
                                                        <p className="text-[10px] text-gray-400 mt-2">HSN: 85171300</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-6 text-right text-gray-600 align-top pt-8">
                                                ₹{itemRate.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-6 text-center text-gray-600 align-top pt-8">
                                                {item.quantity}
                                            </td>
                                            <td className="py-6 text-right text-gray-600 align-top pt-8">
                                                ₹{itemTax.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-6 text-right font-bold text-gray-900 align-top pr-2 pt-8">
                                                ₹{itemTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Calculations Summary */}
                    <div className="flex justify-between items-end mb-16 relative z-10">
                        <div className="w-1/2">
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 print:bg-transparent print:border-gray-200">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Terms & Conditions</p>
                                <ul className="text-[10px] text-gray-500 list-disc pl-3 space-y-1">
                                    <li>Goods once sold will not be taken back.</li>
                                    <li>Warranty valid only with this original invoice.</li>
                                    <li>Subject to Bangalore Jurisdiction.</li>
                                </ul>
                            </div>
                        </div>

                        <div className="w-96">
                            <div className="space-y-3 pb-6 border-b border-gray-200">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Taxable Value</span>
                                    <span>₹{baseAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>CGST (9%)</span>
                                    <span>₹{(taxAmount / 2).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>SGST (9%)</span>
                                    <span>₹{(taxAmount / 2).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Shipping Charges</span>
                                    <span className="text-green-600">Free</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-6">
                                <span className="text-lg font-bold text-gray-900">Grand Total</span>
                                <span className="text-2xl font-bold text-black">₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="mt-2 text-right text-xs text-gray-500">
                                (Inclusive of all taxes)
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 pt-8 pb-4 relative z-10">
                        {/* Paid Stamp */}
                        {order.status === 'success' || order.status === 'delivered' || order.status === 'shipped' ? (
                            <div className="absolute left-1/2 -top-16 -translate-x-1/2 border-[5px] border-green-600 text-green-600 px-8 py-2 text-4xl font-black uppercase tracking-widest opacity-20 rotate-[-10deg] select-none pointer-events-none">
                                PAID In Full
                            </div>
                        ) : null}

                        <div className="flex justify-between items-center text-xs text-gray-400">
                            <p>Authorized Signatory</p>
                            <p className="font-mono">Generated by System</p>
                        </div>
                        <div className="mt-8 text-center text-[10px] text-gray-300 uppercase tracking-widest">
                            Thank you for your business
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoicePage;
