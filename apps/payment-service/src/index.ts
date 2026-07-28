import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { clerkMiddleware } from "@hono/clerk-auth";
import sessionRoute from "./routes/session.route.js";
import razorpayRoute from "./routes/razorpay.route.js";
import { cors } from "hono/cors";
import { consumer, producer } from "./utils/kafka.js";
import { runKafkaSubscriptions } from "./utils/subscriptions.js";
import webhookRoute from "./routes/webhooks.route.js";

const app = new Hono();
app.use("*", cors({
  origin: (origin) => {
    if (!origin) return null;
    if (
      origin === "http://localhost:3500" ||
      origin === "http://localhost:3501" ||
      origin === "http://localhost:3000" ||
      /\.vercel\.app$/.test(origin)
    ) {
      return origin;
    }
    return null;
  },
  credentials: true,
}));
app.use("*", clerkMiddleware());

app.get("/", (c) => {
  return c.json({
    service: "payment-service",
    version: "1.0.0",
    status: "running",
    port: 8002,
    endpoints: {
      health: "/health",
      razorpay: "/razorpay/*",
      sessions: "/sessions/*",
      webhooks: "/webhooks/*",
    },
  });
});

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

app.route("/sessions", sessionRoute);
app.route("/razorpay", razorpayRoute);
app.route("/webhooks", webhookRoute);

// app.post("/create-stripe-product", async (c) => {
//   const res = await stripe.products.create({
//     id: "123",
//     name: "Test Product",
//     default_price_data: {
//       currency: "usd",
//       unit_amount: 10 * 100,
//     },
//   });

//   return c.json(res);
// });

// app.get("/stripe-product-price", async (c) => {
//   const res = await stripe.prices.list({
//     product: "123",
//   });

//   return c.json(res);
// });

const start = async () => {
  try {
    // Start the server first
    const port = Number(process.env.PORT) || 8002;
    serve(
      {
        fetch: app.fetch,
        port,
      },
      (info) => {
        console.log(`Payment service is running on port ${port}`);
      }
    );

    // Connect to Kafka in background (non-blocking)
    Promise.all([producer.connect(), consumer.connect()])
      .then(() => {
        console.log("Kafka connected successfully");
        runKafkaSubscriptions().catch(console.error);
      })
      .catch((err) => console.log("Kafka connection failed (service will continue):", err.message));
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
start();
