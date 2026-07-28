import Fastify from "fastify";
import { clerkPlugin } from "@clerk/fastify";
import cors from "@fastify/cors";
import { shouldBeUser } from "./middleware/authMiddleware.js";
import { connectOrderDB } from "@repo/order-db";
import { orderRoute } from "./routes/order.js";
import { consumer, producer } from "./utils/kafka.js";
import { runKafkaSubscriptions } from "./utils/subscriptions.js";

const fastify = Fastify();

fastify.register(cors, {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
});

fastify.register(clerkPlugin);

fastify.get("/", (request, reply) => {
  return reply.status(200).send({
    service: "order-service",
    version: "1.0.0",
    status: "running",
    port: 8005,
    endpoints: {
      health: "/health",
      orders: "/orders",
      userOrders: "/user-orders",
      orderChart: "/order-chart",
    },
  });
});

fastify.get("/health", (request, reply) => {
  return reply.status(200).send({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

// Quick DB viewer (remove in production)
fastify.get("/db-test", async (request, reply) => {
  const { Order } = await import("@repo/order-db");
  const orders = await Order.find().limit(10).sort({ createdAt: -1 });
  return reply.send({
    totalOrders: await Order.countDocuments(),
    recentOrders: orders,
  });
});

fastify.get("/test", { preHandler: shouldBeUser }, (request, reply) => {
  return reply.send({
    message: "Order service is authenticated!",
    userId: request.userId,
  });
});

import { analyticsRoute } from "./routes/analytics.js";

fastify.register(orderRoute);
fastify.register(analyticsRoute);

const start = async () => {
  try {
    // Start the HTTP server first
    const port = Number(process.env.PORT) || 8005;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Order service is running on port ${port}`);

    // Connect to MongoDB in background (non-blocking but log errors)
    connectOrderDB()
      .then(() => console.log("Connected to MongoDB"))
      .catch((err) => {
        console.error("MongoDB connection failed:", err.message);
        console.error("⚠️  Order service running but database unavailable");
        console.error("⚠️  Fix: Add your IP to MongoDB Atlas Network Access");
      });

    // Connect to Kafka in background (non-blocking)
    Promise.all([producer.connect(), consumer.connect()])
      .then(() => {
        console.log("Kafka connected successfully");
        runKafkaSubscriptions().catch(console.error);
      })
      .catch((err) => console.log("Kafka connection failed (service will continue):", err.message));
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};
start();
