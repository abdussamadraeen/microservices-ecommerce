import { Hono } from "hono";
import Razorpay from "razorpay";
import { shouldBeUser } from "../middleware/authMiddleware.js";

const razorpayRoute = new Hono();

// Initialize Razorpay (will fail gracefully if keys not set)
let razorpay: Razorpay | null = null;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
} catch (error) {
  console.log("Razorpay not configured:", error);
}

// Create Razorpay Order
razorpayRoute.post("/create-order", shouldBeUser, async (c) => {
  const { amount, currency = "INR" } = await c.req.json();

  console.log("💳 Create order request:", { amount, currency });

  if (!razorpay) {
    console.warn("⚠️ Razorpay not configured - returning mock order");
    // Return mock order if Razorpay not configured
    const mockOrder = {
      id: `order_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      currency,
      status: "created",
      mock: true,
    };
    console.log("✅ Mock order created:", mockOrder);
    return c.json(mockOrder);
  }

  try {
    console.log("📡 Creating order with Razorpay API...");
    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: `receipt_${Date.now()}`,
    });

    console.log("✅ Razorpay order created successfully:", { orderId: order.id, amount: order.amount });
    return c.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
    });
  } catch (error) {
    console.error("❌ Razorpay order creation error:", error instanceof Error ? error.message : String(error));
    const errorMessage = error instanceof Error ? error.message : "Failed to create Razorpay order";
    return c.json({ 
      error: "Failed to create Razorpay order",
      details: errorMessage,
      timestamp: new Date().toISOString(),
    }, 500);
  }
});

// Verify Razorpay Payment
razorpayRoute.post("/verify-payment", shouldBeUser, async (c) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await c.req.json();

  console.log("🔐 Verifying payment signature:", { orderId: razorpay_order_id, paymentId: razorpay_payment_id });

  if (!razorpay) {
    console.warn("⚠️ Razorpay not configured - mock verification passed");
    return c.json({ verified: true, mock: true });
  }

  try {
    const crypto = await import("crypto");
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    
    if (!secret) {
      throw new Error("RAZORPAY_KEY_SECRET not configured");
    }

    console.log("🔑 Using Razorpay secret key for verification...");
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    const verified = expectedSignature === razorpay_signature;
    
    if (verified) {
      console.log("✅ Payment signature verified successfully");
    } else {
      console.warn("❌ Payment signature mismatch - verification failed");
    }
    
    return c.json({ verified, orderId: razorpay_order_id, paymentId: razorpay_payment_id });
  } catch (error) {
    console.error("❌ Razorpay verification error:", error instanceof Error ? error.message : String(error));
    return c.json({ 
      verified: false, 
      error: "Verification failed",
      details: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }, 500);
  }
});

export default razorpayRoute;
