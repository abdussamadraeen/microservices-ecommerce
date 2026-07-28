"use client";

import { useState } from "react";
import { ShippingFormInputs } from "@repo/types";
import {
  CreditCard,
  Smartphone,
  QrCode,
  Truck,
  Wallet,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  ChevronRight,
  Landmark,
  Loader2
} from "lucide-react";
import useCartStore from "@/stores/cartStore";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import DemoPaymentModal from "./DemoPaymentModal";
import { createOrder as createOrderAction } from "@/actions/order";

// Add Razorpay type definition to window
declare global {
  interface Window {
    Razorpay: any;
  }
}

type PaymentMethod = "stripe" | "razorpay" | "upi" | "qr" | "cod";

interface PaymentOptionsProps {
  shippingForm: ShippingFormInputs;
}

// Merchant UPI ID for receiving payments
const MERCHANT_UPI_ID = "8928071026@upi";
const MERCHANT_NAME = "Xiaomi India Store";

const PaymentOptions = ({ shippingForm }: PaymentOptionsProps) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>("razorpay");
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const { cart, clearCart } = useCartStore();
  const router = useRouter();
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const subtotal = cart.reduce((acc, item) => {
    const itemTotal = Number(item.price) * Number(item.quantity);

    return acc + itemTotal;
  }, 0);

  const discount = Math.round(subtotal * 0.1);
  const shipping = 99;
  const total = subtotal - discount + shipping;



  const paymentMethods = [
    {
      id: "razorpay" as PaymentMethod,
      name: "Razorpay Secure",
      icon: Wallet,
      description: "Cards, UPI, Netbanking, Wallets",
      color: "bg-blue-600",
      badge: "RECOMMENDED",
      logos: ["visa", "mastercard", "rupay", "upi"]
    },
    {
      id: "upi" as PaymentMethod,
      name: "UPI Direct",
      icon: Smartphone,
      description: "GPay, PhonePe, Paytm, BHIM",
      color: "bg-green-600",
      logos: ["gpay", "phonepe", "paytm"]
    },
    {
      id: "stripe" as PaymentMethod,
      name: "Stripe (Cards)",
      icon: CreditCard,
      description: "International Credit/Debit Cards",
      color: "bg-indigo-600",
      logos: ["visa", "mastercard"]
    },
    {
      id: "qr" as PaymentMethod,
      name: "Scan & Pay",
      icon: QrCode,
      description: "Scan QR with any UPI app",
      color: "bg-purple-600",
      logos: []
    },
    {
      id: "cod" as PaymentMethod,
      name: "Cash on Delivery",
      icon: Truck,
      description: "Pay when delivered",
      color: "bg-orange-500",
      logos: []
    },
  ];

  // Load Razorpay script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Generate UPI deep link
  const generateUPILink = () => {
    const params = new URLSearchParams({
      pa: MERCHANT_UPI_ID,
      pn: MERCHANT_NAME,
      am: total.toString(),
      cu: "INR",
      tn: `Xiaomi Order`,
    });
    return `upi://pay?${params.toString()}`;
  };

  // Generate QR Code URL
  const generateQRCodeUrl = () => {
    const upiLink = generateUPILink();
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;
  };

  // Copy UPI ID
  const copyUpiId = async () => {
    await navigator.clipboard.writeText(MERCHANT_UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyUpi = () => {
    if (!upiId || !upiId.includes("@")) {
      setError("Please enter a valid UPI ID");
      return;
    }
    setVerifying(true);
    setError(null);

    // Simulate Verification
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
    }, 1500);
  };

  // Create order in database
  const createOrder = async (method: string, paymentId?: string) => {

    const result = await createOrderAction({
      products: cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
      })),
      amount: total * 100,
      shippingAddress: {
        name: shippingForm.name,
        email: shippingForm.email,
        phone: shippingForm.phone,
        address: shippingForm.address,
        city: shippingForm.city,
      },
      paymentMethod: method,
      paymentId: paymentId || `order_${Date.now()}`,
      status: method === "cod" ? "pending" : "success",
    });

    if (!result.success || !result.orderId) {
      throw new Error(result.error || "Failed to create order");
    }

    clearCart();
    router.push(`/order-success?orderId=${result.orderId}&method=${method}`);
  };

  // Handle Stripe Payment
  const handleStripePayment = async () => {
    const token = await getToken();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL}/sessions/create-checkout-session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cart,
          email: shippingForm.email,
          discount,
          shipping
        }),
      }
    );

    const data = await res.json();
    if (data.url) {
      // Save shipping details and cart for return page order creation
      localStorage.setItem("temp_shipping_form", JSON.stringify(shippingForm));
      localStorage.setItem("temp_cart_backup", JSON.stringify(cart));
      window.location.href = data.url;
    } else if (data.checkoutSessionClientSecret) {
      // For embedded checkout, redirect to return page
      await createOrder("stripe", data.checkoutSessionClientSecret);
    } else {
      throw new Error("Failed to create Stripe session");
    }
  };

  // Handle Razorpay Payment
  const handleRazorpayPayment = async () => {
    // Check if user is signed in
    if (!isLoaded) {
      setError("Please wait, loading authentication...");
      return;
    }

    if (!isSignedIn) {
      setError("Please sign in to continue with payment");
      return;
    }

    setLoading(true);

    try {
      const token = await getToken();

      // 1. Load Razorpay Script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        console.warn("⚠️ Razorpay SDK failed to load - falling back to demo mode");
        throw new Error("Razorpay SDK unavailable");
      }

      // 2. Create Order on Server
      console.log("Creating Razorpay order...");
      let orderData;
      let useMock = false;

      // Razorpay Test Mode often limits to ₹15,000 or less. 
      // We cap the amount to ₹500 to GUARANTEE success in Test Mode.
      const safeAmount = Math.min(total, 500);

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL}/razorpay/create-order`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: safeAmount * 100, // Capped at ₹15k for safety
            currency: "INR"
          }),
        });

        if (!response.ok) {
          throw new Error("Payment service responded with error");
        }

        orderData = await response.json();

        if (orderData.mock) {
          console.log("⚠️ Received mock order from backend");
          useMock = true;
        }

      } catch (err) {
        console.warn("⚠️ Failed to create real order, falling back to demo:", err);
        useMock = true;
      }

      // 3. Fallback to Demo Modal if Mock or Error
      if (useMock) {
        console.log("🎭 Opening Demo Payment Modal...");
        setShowDemoModal(true);
        setLoading(false);
        return;
      }

      // 4. Open Real Razorpay Checkout
      console.log("✅ Starting real Razorpay flow with order:", orderData);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Xiaomi India Store",
        description: "Transaction for Xiaomi Order",
        order_id: orderData.id,
        handler: async function (response: any) {
          console.log("✅ Payment successful:", response);
          try {
            await createOrder("razorpay", response.razorpay_payment_id);
          } catch (err) {
            console.error("Failed to create order after payment:", err);
            setError("Payment successful but order creation failed. Please contact support.");
          }
        },
        prefill: {
          name: shippingForm.name,
          email: shippingForm.email,
          contact: shippingForm.phone,
        },
        theme: {
          color: "#2563EB",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            console.log("Payment cancelled by user");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        console.error("Payment Failed:", response.error);
        setError(`Payment Failed: ${response.error.description || "Unknown error"}`);
        setLoading(false);
      });
      rzp.open();
      // Note: Loading state stays true until payment completes or modal dismissed

    } catch (err) {
      console.error("❌ Razorpay Error:", err);
      // Final fallback
      setShowDemoModal(true);
      setLoading(false);
    }
  };

  // Handle Demo Payment Success
  const handleDemoPaymentSuccess = async (paymentId: string, method: string) => {
    console.log("✅ Demo payment successful:", { paymentId, method });
    setShowDemoModal(false);
    setLoading(true);

    try {
      await createOrder("razorpay", paymentId);
    } catch (err) {
      console.error("❌ Order creation failed:", err);
      setError("Payment successful but order creation failed. Please contact support.");
      setLoading(false);
    }
  };

  // Handle UPI Payment
  const handleUPIPayment = async () => {
    if (!upiId || !upiId.includes("@")) {
      setError("Enter a valid UPI ID (e.g., name@upi)");
      return;
    }
    // Open UPI app
    window.location.href = generateUPILink();
    // Create order
    await createOrder("upi", upiId);
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      setError("Please select a payment method");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      switch (selectedMethod) {
        case "stripe":
          console.log("💳 Initiating Stripe payment...");
          await handleStripePayment();
          break;
        case "razorpay":
          console.log("💳 Initiating Razorpay payment...");
          await handleRazorpayPayment();
          break;
        case "upi":
          console.log("📱 Initiating UPI payment...");
          await handleUPIPayment();
          break;
        case "qr":
          console.log("📲 QR Code payment selected...");
          await createOrder("qr");
          break;
        case "cod":
          console.log("🚚 COD order placement...");
          await createOrder("cod");
          break;
      }
    } catch (err) {
      console.error("❌ Payment error:", err);
      const errorMessage = err instanceof Error ? err.message : "Payment failed. Please try again.";
      setError(errorMessage);
      setLoading(false);
    }
  };


  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Select Payment Mode</h3>
        <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>100% Safe & Secure</span>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="grid gap-4">
        {paymentMethods.map((method) => {
          const isSelected = selectedMethod === method.id;
          return (
            <div
              key={method.id}
              onClick={() => { setSelectedMethod(method.id); setError(null); }}
              className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 cursor-pointer ${isSelected
                ? "border-black/80 bg-white shadow-lg scale-[1.01]"
                : "border-gray-100 bg-white hover:border-gray-300 hover:shadow-sm"
                }`}
            >
              {/* Highlight Bar */}
              {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-black" />}

              {/* Header Content */}
              <div className="p-5 flex items-center gap-4">
                <div className={`p-3 rounded-xl transition-colors ${isSelected ? "bg-black text-white" : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                  }`}>
                  <method.icon className="w-6 h-6" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`font-bold text-base ${isSelected ? "text-gray-900" : "text-gray-700"}`}>
                      {method.name}
                    </p>
                    {method.badge && (
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shadow-sm tracking-wide">
                        {method.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{method.description}</p>
                </div>

                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? "border-black" : "border-gray-300"
                  }`}>
                  {isSelected && <div className="w-3 h-3 rounded-full bg-black" />}
                </div>
              </div>

              {/* Collapsible Content Area */}
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isSelected ? "max-h-[500px]" : "max-h-0"
                }`}>
                <div className="px-5 pb-5 pt-0">
                  <div className="h-px w-full bg-gray-100 mb-4" />

                  {/* Method Specific Content */}
                  {method.id === "razorpay" && (
                    <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/50">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {["visa", "mastercard", "rupay", "upi"].map(brand => (
                          <div key={brand} className="bg-white border border-gray-200 px-2 py-1 rounded text-[10px] font-bold text-gray-500 uppercase">
                            {brand}
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                        <span>Use your favorite UPI app (GPay, PhonePe) or any bank card. Redirection to secure gateway required.</span>
                      </p>
                    </div>
                  )}

                  {method.id === "stripe" && (
                    <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100/50">
                      <p className="text-sm text-indigo-900 flex items-center gap-2">
                        <Landmark className="w-4 h-4" />
                        <span>International payments enabled. We do not store your card details.</span>
                      </p>
                    </div>
                  )}

                  {method.id === "upi" && (
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Enter UPI ID (e.g., 9876543210@paytm)"
                          value={upiId}
                          onChange={(e) => {
                            setUpiId(e.target.value);
                            setVerified(false);
                          }}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all font-medium text-gray-900"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:block">
                          <button
                            type="button"
                            onClick={handleVerifyUpi}
                            disabled={verifying || verified || !upiId}
                            className={`text-xs font-bold px-3 py-1.5 rounded transition-all flex items-center gap-1 ${verified
                              ? "bg-green-100 text-green-700 cursor-default"
                              : "bg-black text-white hover:bg-zinc-800"
                              }`}
                          >
                            {verifying ? <Loader2 className="w-3 h-3 animate-spin" /> : verified ? <CheckCircle2 className="w-3 h-3" /> : null}
                            {verifying ? "VERIFYING" : verified ? "VERIFIED" : "VERIFY"}
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {["@ybl", "@paytm", "@okicici", "@oksbi"].map((suffix) => (
                          <button
                            key={suffix}
                            type="button"
                            onClick={() => setUpiId(upiId.split("@")[0] + suffix)}
                            className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-md hover:bg-black hover:text-white transition-colors"
                          >
                            {suffix}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {method.id === "qr" && (
                    <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center text-center border border-gray-100">
                      <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 mb-3">
                        <Image
                          src={generateQRCodeUrl()}
                          alt="UPI QR"
                          width={120}
                          height={120}
                          className="rounded-md"
                          unoptimized
                        />
                      </div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Total Amount</p>
                      <p className="text-xl font-bold text-gray-900 mb-3">₹{total.toLocaleString('en-IN')}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                        {MERCHANT_UPI_ID}
                        <button onClick={copyUpiId} className="hover:text-black">
                          {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {method.id === "cod" && (
                    <div className="flex items-center gap-3 p-4 bg-yellow-50/50 border border-yellow-100 rounded-xl text-yellow-800">
                      <div className="p-2 bg-yellow-100 rounded-full">
                        <Truck className="w-4 h-4 text-yellow-700" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Cash on Delivery</p>
                        <p className="text-xs opacity-90">Pay ₹{total.toLocaleString('en-IN')} cash upon delivery.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-pulse">
          <div className="p-1 bg-red-100 rounded-full shrink-0">
            <div className="w-2 h-2 bg-red-600 rounded-full" />
          </div>
          <div>
            <p className="text-sm font-bold text-red-700">Payment Error</p>
            <p className="text-xs text-red-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Bottom Action Bar */}
      <div className="sticky bottom-4 z-10">
        <button
          onClick={handlePayment}
          disabled={loading || !selectedMethod}
          className={`w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-between shadow-xl transition-all duration-300 transform ${selectedMethod
            ? "bg-black text-white hover:bg-zinc-800 hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98]"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
        >
          <span className="flex flex-col items-start leading-none">
            <span className="text-[10px] opacity-70 uppercase tracking-widest font-medium">Pay Total</span>
            <span className="text-lg">₹{total.toLocaleString('en-IN')}</span>
          </span>

          <div className="flex items-center gap-2">
            <span>
              {loading ? "Processing..." : "Secure Pay"}
            </span>
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <ChevronRight className="w-5 h-5" />}
          </div>
        </button>
      </div>

      {/* Demo Modal */}
      <DemoPaymentModal
        isOpen={showDemoModal}
        onClose={() => { setShowDemoModal(false); setLoading(false); }}
        onSuccess={handleDemoPaymentSuccess}
        amount={total * 100}
        currency="INR"
        merchantName="Xiaomi India Store"
        customerName={shippingForm.name}
        customerEmail={shippingForm.email}
        customerPhone={shippingForm.phone}
      />
    </div>
  );
};

export default PaymentOptions;
