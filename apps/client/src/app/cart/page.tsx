"use client";

import ShippingForm from "@/components/ShippingForm";
import PaymentOptions from "@/components/PaymentOptions";
import useCartStore from "@/stores/cartStore";
import { CartItemsType, ShippingFormInputs } from "@repo/types";
import { ArrowRight, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useAuth } from "@clerk/nextjs";

const steps = [
  {
    id: 1,
    title: "Shopping Cart",
  },
  {
    id: 2,
    title: "Shipping Address",
  },
  {
    id: 3,
    title: "Payment Method",
  },
];


const CartPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [shippingForm, setShippingForm] = useState<ShippingFormInputs>();

  const activeStep = parseInt(searchParams.get("step") || "1");

  const { cart, removeFromCart, updateQuantity } = useCartStore();

  const subtotal = cart.reduce((acc, item) => {
    const total = Number(item.price) * Number(item.quantity);
    return acc + total;
  }, 0);

  const discount = Math.round(subtotal * 0.1); // 10% discount
  const shippingFee = cart.length > 0 ? 99 : 0;
  const total = subtotal - discount + shippingFee;



  // Empty Cart State
  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-in fade-in duration-500">
        <div className="relative">
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-4xl">🛒</span>
          </div>
          <div className="absolute -top-2 -right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-white">
            0
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h1>
          <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
          <button
            onClick={() => router.push("/")}
            className="px-8 py-3 bg-black text-white rounded-full font-semibold hover:bg-zinc-800 hover:scale-105 transition-all shadow-lg"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 items-center justify-center mt-12 pb-20">
      {/* TITLE */}
      <h1 className="text-2xl font-bold tracking-tight">Checkout</h1>
      {/* STEPS */}
      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
        {steps.map((step) => (
          <button
            onClick={() => router.push(`/cart?step=${step.id}`)}
            className={`flex items-center gap-2 border-b-2 pb-4 transition-all cursor-pointer ${step.id === activeStep ? "border-black" : "border-gray-200 hover:border-gray-300"
              }`}
            key={step.id}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors font-bold ${step.id === activeStep ? "bg-black text-white" : "bg-gray-200 text-gray-500"
                }`}
            >
              {step.id}
            </div>
            <p
              className={`text-sm font-medium transition-colors ${step.id === activeStep ? "text-black" : "text-gray-400"
                }`}
            >
              {step.title}
            </p>
          </button>
        ))}
      </div>
      {/* STEPS & DETAILS */}
      <div className="w-full flex flex-col lg:flex-row gap-16 px-4 md:px-0">
        {/* STEPS */}
        <div className="w-full lg:w-7/12 shadow-sm border border-gray-200 p-6 md:p-8 rounded-2xl flex flex-col gap-8 bg-white">
          {activeStep === 1 ? (
            <div className="space-y-6">
              {cart.map((item) => (
                // SINGLE CART ITEM
                <div
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 p-2 rounded-xl transition-colors"
                  key={item.id + item.selectedSize + item.selectedColor}
                >
                  {/* IMAGE AND DETAILS */}
                  <div className="flex gap-6 w-full">
                    {/* IMAGE */}
                    <div className="relative w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center shrink-0 border border-gray-200">
                      {(() => {
                        const img = (item.images as Record<string, string | string[]>)?.[item.selectedColor];
                        const src = Array.isArray(img) ? img[0] : img;

                        if (!src) return <span className="text-gray-400 text-xs">No Img</span>;

                        return (
                          <Image
                            src={src}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        )
                      })()}
                    </div>
                    {/* ITEM DETAILS */}
                    <div className="flex flex-col justify-between flex-1">
                      <div className="flex flex-col gap-1">
                        <p className="font-bold text-gray-900">{item.name}</p>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="capitalize bg-gray-100 px-2 py-0.5 rounded text-xs">{item.selectedColor}</span>
                          <span className="uppercase bg-gray-100 px-2 py-0.5 rounded text-xs">Size: {item.selectedSize}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                          <button
                            onClick={() => updateQuantity(item, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-gray-600"
                          >
                            −
                          </button>
                          <span className="text-sm font-semibold w-8 text-center bg-gray-50 h-8 flex items-center justify-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-all text-gray-600"
                          >
                            +
                          </button>
                        </div>
                        <p className="font-bold text-gray-900 text-lg">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </div>
                  {/* DELETE BUTTON */}
                  <button
                    onClick={() => removeFromCart(item)}
                    title="Remove item"
                    className="absolute top-2 right-2 sm:static w-8 h-8 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : activeStep === 2 ? (
            <ShippingForm setShippingForm={setShippingForm} />
          ) : activeStep === 3 && shippingForm ? (
            <PaymentOptions shippingForm={shippingForm} />
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">Please fill in the shipping details first.</p>
              <button onClick={() => router.push("/cart?step=2")} className="text-black font-bold underline underline-offset-4">Go to Shipping</button>
            </div>
          )}
        </div>
        {/* DETAILS */}
        <div className="w-full lg:w-5/12 h-fit space-y-6">
          <div className="shadow-sm border border-gray-200 p-8 rounded-2xl flex flex-col gap-6 bg-white sticky top-24">
            <h2 className="font-bold text-lg mb-2">Order Summary</h2>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between text-sm">
                <p className="text-gray-600">Subtotal ({cart.length} items)</p>
                <p className="font-semibold">₹{subtotal.toLocaleString('en-IN')}</p>
              </div>
              <div className="flex justify-between text-sm">
                <p className="text-gray-600">Discount (10%)</p>
                <p className="font-semibold text-green-600">-₹{discount.toLocaleString('en-IN')}</p>
              </div>
              <div className="flex justify-between text-sm">
                <p className="text-gray-600">Shipping Fee</p>
                <p className="font-semibold">{shippingFee === 0 ? "FREE" : `₹${shippingFee}`}</p>
              </div>
              <div className="h-px bg-gray-100 my-2" />
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-lg font-bold text-gray-900">Total</p>
                  <p className="text-[10px] text-gray-500">Including Tax</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">₹{total.toLocaleString('en-IN')}</p>
              </div>
            </div>

            {activeStep === 1 && (
              <button
                onClick={() => {
                  if (isSignedIn) {
                    router.push("/cart?step=2", { scroll: false });
                  } else {
                    router.push("/sign-in?redirect_url=/cart?step=2");
                  }
                }}
                className="w-full bg-black hover:bg-zinc-800 transition-all duration-300 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-black/10 hover:shadow-black/20 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                {isSignedIn ? "Continue to Shipping" : "Sign in to Checkout"}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-xs text-gray-500 space-y-2">
            <p>🔒 <strong>Secure Checkout</strong> - Your data is protected.</p>
            <p>🚚 <strong>Fast Delivery</strong> - Get it within 3-5 days.</p>
            <p>↩️ <strong>Easy Returns</strong> - 30 days return policy.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const CartPageWrapper = () => (
  <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><div className="animate-pulse text-gray-400">Loading cart...</div></div>}>
    <CartPage />
  </Suspense>
);

export default CartPageWrapper;
