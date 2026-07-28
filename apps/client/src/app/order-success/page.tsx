"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Package, MapPin, CreditCard, ArrowRight, Home, Copy, Check } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { MiLoader } from "@/components/MiLoader";

// -- Confetti Utility (Embedded for single-file portability) --
const fireConfetti = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles: any[] = [];
  const colors = ["#ff5722", "#2196f3", "#4caf50", "#ffeb3b", "#e91e63"];

  for (let i = 0; i < 150; i++) {
    particles.push({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      w: Math.random() * 8 + 2,
      h: Math.random() * 8 + 2,
      vx: (Math.random() - 0.5) * 20,
      vy: (Math.random() - 0.5) * 20,
      color: colors[Math.floor(Math.random() * colors.length)],
      gravity: 0.1,
      drag: 0.96,
    });
  }

  const animate = () => {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let activeParticles = 0;
    particles.forEach((p) => {
      if (p.w > 0.1) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.w *= 0.96;
        p.h *= 0.96;

        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.w, p.h);
        activeParticles++;
      }
    });

    if (activeParticles > 0) {
      requestAnimationFrame(animate);
    }
  };

  animate();
};

const OrderSuccessPage = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const method = searchParams.get("method");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { getToken } = useAuth();
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      fireConfetti(canvasRef.current);
    }

    const fetchOrderDetails = async () => {
      if (!orderId) return;
      try {
        const token = await getToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_ORDER_SERVICE_URL}/order/${orderId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch (err) {
        console.error("Failed to fetch order", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, getToken]);

  const copyOrderId = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const paymentMethodLabels: Record<string, string> = {
    card: "Credit/Debit Card",
    stripe: "Stripe (International)",
    upi: "UPI Direct",
    qr: "Scan & Pay",
    razorpay: "Razorpay Secure",
    cod: "Cash on Delivery",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <MiLoader />
          <p className="text-sm text-gray-400 font-medium animate-pulse">Processing your order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#FAFAFA] overflow-hidden font-sans pb-20">
      {/* Confetti Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-50"
      />

      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-green-50/80 to-transparent pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-100 rounded-full blur-[100px] opacity-40 pointer-events-none" />
      <div className="absolute top-40 -left-20 w-72 h-72 bg-purple-100 rounded-full blur-[80px] opacity-40 pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-4 pt-16 sm:pt-24 z-10">

        {/* Success Header */}
        <div className="text-center mb-12 animate-in slide-in-from-bottom-5 duration-700 fade-in">
          <div className="relative inline-flex items-center justify-center w-28 h-28 mb-8">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20 duration-[2s]"></div>
            <div className="relative bg-gradient-to-br from-green-400 to-green-600 rounded-full p-6 shadow-xl shadow-green-200">
              <CheckCircle2 className="w-16 h-16 text-white" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Order Confirmed!
          </h1>
          <p className="text-lg text-gray-500 max-w-md mx-auto">
            Thank you for your purchase. We've received your order and are getting it ready.
          </p>
        </div>

        {/* Order Receipt Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.05)] border border-white/50 overflow-hidden animate-in slide-in-from-bottom-10 duration-1000 delay-200 fill-mode-backwards">

          {/* Order ID Banner */}
          <div className="bg-gray-50/50 border-b border-gray-100 px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Order ID</span>
              <div
                onClick={copyOrderId}
                className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg cursor-pointer hover:border-gray-300 transition-colors group"
              >
                <span className="font-mono font-bold text-gray-700">{orderId?.slice(-8).toUpperCase()}</span>
                {copiedId ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />}
              </div>
            </div>
            <div className="text-sm font-medium text-gray-500">
              {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}  •  {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <div className="p-8 space-y-10">

            {/* Timeline Progress */}
            <div className="relative">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full" />
              <div className="absolute top-1/2 left-0 w-[15%] h-1 bg-green-500 -translate-y-1/2 rounded-full" />
              <div className="relative flex justify-between text-xs font-semibold uppercase tracking-wider text-gray-400">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full ring-4 ring-white shadow-sm" />
                  <span className="text-green-600">Ordered</span>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-4 h-4 bg-gray-200 rounded-full ring-4 ring-white" />
                  <span>Processing</span>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-4 h-4 bg-gray-200 rounded-full ring-4 ring-white" />
                  <span>Shipped</span>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-4 h-4 bg-gray-200 rounded-full ring-4 ring-white" />
                  <span>Delivered</span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12">

              {/* Left Column: Details */}
              <div className="space-y-8">
                {/* Shipping */}
                {order?.shippingAddress && (
                  <div className="group">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" /> Shipping To
                    </h3>
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 group-hover:border-gray-200 transition-colors">
                      <p className="font-bold text-gray-900 text-lg mb-1">{order.shippingAddress.name}</p>
                      <p className="text-gray-600 leading-relaxed">
                        {order.shippingAddress.address}<br />
                        {order.shippingAddress.city}
                      </p>
                      <p className="text-gray-500 text-sm mt-3 pt-3 border-t border-gray-200 flex items-center gap-2">
                        <span>📞 {order.shippingAddress.phone}</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Payment */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-400" /> Payment
                  </h3>
                  <div className="flex items-center justify-between p-4 bg-green-50/50 border border-green-100 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm text-green-600">
                        {method === "upi" || method === "qr" ? "UPI" : method === "cod" ? "💵" : "💳"}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{paymentMethodLabels[method as string] || method}</p>
                        <p className="text-xs text-green-700 font-medium">Payment Verified</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-gray-900">₹{order?.amount ? (order.amount / 100).toLocaleString('en-IN') : '0'}</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Items */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-400" /> Order Summary
                </h3>

                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  {order?.products && (
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                      {order.products.map((product: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-4 p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                          <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                            <Package className="w-8 h-8 text-gray-300" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 truncate">{product.name}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-medium">Qty: {product.quantity}</span>
                              {product.selectedSize && <span>Size: {product.selectedSize}</span>}
                            </div>
                          </div>
                          <p className="font-bold text-gray-900">₹{(product.price * product.quantity).toLocaleString('en-IN')}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="bg-gray-50/80 p-5 space-y-3">
                    <div className="flex justify-between text-gray-600 text-sm">
                      <span>Subtotal</span>
                      <span>₹{order?.amount ? (order.amount / 100).toLocaleString('en-IN') : '0'}</span>
                    </div>
                    <div className="flex justify-between text-green-600 text-sm font-medium">
                      <span>Shipping</span>
                      <span>FREE</span>
                    </div>
                    <div className="h-px bg-gray-200 my-2" />
                    <div className="flex justify-between items-end">
                      <span className="text-gray-900 font-bold">Total Processed</span>
                      <span className="text-2xl font-black text-gray-900">₹{order?.amount ? (order.amount / 100).toLocaleString('en-IN') : '0'}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom-5 duration-700 delay-500 fill-mode-backwards">
          <Link
            href="/orders"
            className="w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-2 py-4 px-8 bg-black text-white rounded-full font-bold hover:bg-zinc-800 hover:scale-105 transition-all shadow-xl shadow-black/10"
          >
            Track Order
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-2 py-4 px-8 bg-white border-2 border-gray-100 text-gray-800 rounded-full font-bold hover:bg-gray-50 hover:border-gray-200 transition-all"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
};

const OrderSuccessPageWrapper = () => (
  <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-pulse text-gray-400">Loading order details...</div></div>}>
    <OrderSuccessPage />
  </Suspense>
);

export default OrderSuccessPageWrapper;
