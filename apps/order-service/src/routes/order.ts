import { FastifyInstance } from "fastify";
import { shouldBeAdmin, shouldBeUser } from "../middleware/authMiddleware.js";
import { Order } from "@repo/order-db";
import { startOfMonth, subMonths } from "date-fns";
import { OrderChartType } from "@repo/types";
import { producer } from "../utils/kafka.js";

export const orderRoute = async (fastify: FastifyInstance) => {
  fastify.get(
    "/user-orders",
    { preHandler: shouldBeUser },
    async (request, reply) => {
      const orders = await Order.find({ userId: request.userId }).sort({ createdAt: -1 });
      return reply.send(orders);
    }
  );
  fastify.get(
    "/orders",
    { preHandler: shouldBeAdmin },
    async (request, reply) => {
      const { limit, status, search } = request.query as { limit: number; status?: string; search?: string };

      const filter: any = {};

      // Support multiple statuses (comma-separated)
      if (status) {
        const statuses = status.split(",").map(s => s.trim());
        if (statuses.length > 1) {
          filter.status = { $in: statuses };
        } else {
          filter.status = status;
        }
      }

      if (search) {
        const searchRegex = { $regex: search, $options: "i" };
        const baseSearch = [
          { "shippingAddress.name": searchRegex },
          { "shippingAddress.email": searchRegex },
          { "products.name": searchRegex },
          // Add Order ID search if it's a valid hex string (MongoDB ObjectId) or just a string match if stored as string
          // Assuming _id needs to be exactly matched or partial string match if converted to string. 
          // Mongoose find with $or on _id usually requires exact ObjectId. 
          // For simplicity/safety with mixed input, let's catch plain string ID searches if they look like ObjectIds.
        ];

        // Check if search might be an ObjectId (24 hex chars)
        if (/^[0-9a-fA-F]{24}$/.test(search)) {
          filter._id = search; // Exact match for ID
        } else {
          filter.$or = baseSearch;
        }
      }

      const orders = await Order.find(filter).limit(limit).sort({ createdAt: -1 });
      return reply.send(orders);
    }
  );

  // Get Order Stats for Sidebar/Dashboard
  fastify.get(
    "/stats",
    // { preHandler: shouldBeAdmin }, // Optional: Restrict if needed, but sidebar uses it
    async (request, reply) => {
      try {
        const stats = await Order.aggregate([
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 }
            }
          }
        ]);

        const result = stats.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {} as Record<string, number>);

        // Ensure we have at least these keys
        const finalStats = {
          pending: result.pending || 0,
          processing: result.processing || 0,
          shipped: result.shipped || 0,
          delivered: result.delivered || 0,
          success: result.success || 0,
          cancelled: result.cancelled || 0,
          total: (Object.values(result) as number[]).reduce((a, b) => a + b, 0)
        };

        return reply.send(finalStats);
      } catch (error) {
        console.error("Get order stats error:", error);
        return reply.status(500).send({ message: "Failed to get order stats" });
      }
    }
  );

  // Admin Create Order (Manual)
  fastify.post(
    "/orders",
    { preHandler: shouldBeAdmin },
    async (request, reply) => {
      const { userId, amount, status } = request.body as {
        userId: string;
        amount: number;
        status: string;
      };

      try {
        console.log(`Creating manual order for user ${userId}`);

        const order = new Order({
          userId,
          amount,
          status: status || "pending",
          products: [
            {
              id: 999999, // Dummy ID
              name: "Manual Order Adjustment",
              quantity: 1,
              price: amount,
              image: "", // No image
              selectedSize: "N/A",
              selectedColor: "N/A"
            }
          ],
          shippingAddress: {
            name: "Manual Order",
            email: "manual@admin.com", // Placeholder
            address: "Admin Created",
            city: "Admin City",
            phone: "0000000000"
          },
          paymentMethod: "manual",
          paymentId: `manual_${Date.now()}`,
          createdAt: new Date(),
        });

        await order.save();
        console.log("✅ Manual order created:", order._id);
        return reply.status(201).send(order);
      } catch (error) {
        console.error("Manual create order error:", error);
        return reply.status(500).send({ message: "Failed to create order" });
      }
    }
  );
  fastify.get(
    "/order-chart",
    { preHandler: shouldBeAdmin },
    async (request, reply) => {
      const now = new Date();
      const sixMonthsAgo = startOfMonth(subMonths(now, 5));

      // { month: "April", total: 173, successful: 100 }

      const raw = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: sixMonthsAgo, $lte: now },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            total: { $sum: 1 },
            successful: {
              $sum: {
                $cond: [{ $eq: ["$status", "success"] }, 1, 0],
                // {
                //   "year":2025,
                //   "month":9,
                //   "total":100,
                //   "successful":72
                // }
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            year: "$_id.year",
            month: "$_id.month",
            total: 1,
            successful: 1,
          },
        },
        {
          $sort: { year: 1, month: 1 },
        },
      ]);

      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      const results: OrderChartType[] = [];

      for (let i = 5; i >= 0; i--) {
        const d = subMonths(now, i);
        const year = d.getFullYear();
        const month = d.getMonth() + 1;

        const match = raw.find(
          (item) => item.year === year && item.month === month
        );

        results.push({
          month: monthNames[month - 1] as string,
          total: match ? match.total : 0,
          successful: match ? match.successful : 0,
        });
      }

      return reply.send(results);
    }
  );

  // Create order from client
  fastify.post(
    "/create-order",
    { preHandler: shouldBeUser },
    async (request, reply) => {
      const { products, amount, shippingAddress, paymentMethod, paymentId, status: clientStatus } = request.body as {
        products: any[];
        amount: number;
        shippingAddress: {
          name: string;
          email: string;
          phone: string;
          address: string;
          city: string;
        };
        paymentMethod: string;
        paymentId?: string;
        status: string;
      };

      // FORCE Pending status by default for security
      let finalStatus = "pending";

      // Verify Razorpay Payment Server-Side
      if (paymentMethod === "razorpay" && paymentId) {
        try {
          const keyId = process.env.RAZORPAY_KEY_ID;
          const keySecret = process.env.RAZORPAY_KEY_SECRET;

          if (keyId && keySecret) {
            const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
            const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
              headers: {
                Authorization: `Basic ${auth}`,
              },
            });

            if (response.ok) {
              const data: any = await response.json();
              if (data.status === "captured" || data.status === "authorized") {
                finalStatus = "success";
                console.log(`✅ Verified Razorpay payment ${paymentId}: ${data.status}`);
              } else {
                console.warn(`⚠️ Razorpay payment ${paymentId} status: ${data.status} (Keeping order pending)`);
              }
            } else {
              console.error(`❌ Razorpay API failed: ${response.status} ${response.statusText}`);
            }
          } else {
            console.warn("⚠️ Razorpay keys missing in environment variables. Skipping verification.");
            // If keys are missing (dev env), we might trust client or keep pending. 
            // For "Best Only", we keep pending.
          }
        } catch (err) {
          console.error("❌ Razorpay verification error:", err);
        }
      }
      // Handling COD
      else if (paymentMethod === "cod") {
        finalStatus = "pending";
      }
      // Trust Stripe client status for now (since we use Checkout with redirection/embedded)
      else if (paymentMethod === "stripe" && clientStatus === "success") {
        finalStatus = "success";
      }

      console.log("📦 Creating order:", { paymentMethod, paymentId, amount, status: finalStatus });

      try {
        const order = new Order({
          userId: request.userId,
          email: shippingAddress.email,
          products,
          amount,
          shippingAddress,
          paymentMethod,
          paymentId: paymentId || `order_${Date.now()}`,
          status: finalStatus,
          createdAt: new Date(),
        });

        await order.save();
        console.log("✅ Order created:", order._id);

        // Send order confirmation email via Kafka
        if (shippingAddress.email) {
          try {
            await producer.send("order.created", {
              email: shippingAddress.email,
              orderId: order._id,
              amount,
              status: finalStatus,
              products,
              shippingAddress,
              paymentMethod,
            });
            console.log("Order confirmation email queued for:", shippingAddress.email);
          } catch (emailError) {
            console.error("Failed to queue email:", emailError);
          }
        }

        return reply.status(201).send(order);
      } catch (error) {
        console.error("Create order error:", error);
        return reply.status(500).send({ message: "Failed to create order" });
      }
    }
  );

  // Get single order by ID
  fastify.get(
    "/order/:id",
    { preHandler: shouldBeUser },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      try {
        const order = await Order.findById(id);
        if (!order) {
          return reply.status(404).send({ message: "Order not found" });
        }
        // Verify user owns this order
        if (order.userId !== request.userId) {
          return reply.status(403).send({ message: "Unauthorized" });
        }
        return reply.send(order);
      } catch (error) {
        console.error("Get order error:", error);
        return reply.status(500).send({ message: "Failed to get order" });
      }
    }
  );

  // Get alerts for admin inbox
  fastify.get(
    "/alerts",
    async (request, reply) => {
      try {
        const alerts = [];

        // Low stock alerts (from pending orders)
        const pendingOrders = await Order.find({ status: "pending" }).limit(5);
        if (pendingOrders.length > 0) {
          alerts.push({
            id: "pending-orders",
            type: "order",
            title: `${pendingOrders.length} Pending Orders`,
            message: `${pendingOrders.length} orders awaiting payment confirmation`,
            time: pendingOrders[0]?.createdAt ? new Date(pendingOrders[0].createdAt).toLocaleString('en-IN') : new Date().toLocaleString('en-IN'),
            read: false,
          });
        }

        // Recent orders (last 24h)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentOrders = await Order.find({
          createdAt: { $gte: oneDayAgo },
          status: { $ne: "pending" }
        }).limit(3);

        recentOrders.forEach((order) => {
          alerts.push({
            id: order._id.toString(),
            type: "order",
            title: `Order #${order._id.toString().slice(-8).toUpperCase()} ${order.status === "success" ? "Delivered" : "Updated"
              }`,
            message: `₹${(order.amount / 100).toLocaleString("en-IN")} from ${order.shippingAddress?.name || "Customer"}`,
            time: new Date(order.createdAt).toLocaleString('en-IN'),
            read: false,
          });
        });

        return reply.send(alerts);
      } catch (error) {
        console.error("Get alerts error:", error);
        return reply.status(500).send({ message: "Failed to get alerts" });
      }
    }
  );

  // Get scheduled deliveries for calendar
  fastify.get(
    "/deliveries",
    async (request, reply) => {
      try {
        // Orders from last 7 days and next 14 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const fourteenDaysLater = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

        const orders = await Order.find({
          createdAt: { $gte: sevenDaysAgo, $lte: fourteenDaysLater },
          status: { $in: ["success", "pending", "processing", "shipped", "delivered"] }
        }).sort({ createdAt: -1 });

        const deliveries = orders.map((order) => {
          const orderDate = new Date(order.createdAt);
          const deliveryDate = new Date(orderDate.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days later

          return {
            id: order._id.toString(),
            date: deliveryDate.toLocaleDateString('en-IN'),
            time: "Estimated",
            title: `Delivery #${order._id.toString().slice(-8).toUpperCase()}`,
            count: `${order.products?.length || 1} items`,
            type: "delivery",
          };
        });

        return reply.send(deliveries);
      } catch (error) {
        console.error("Get deliveries error:", error);
        return reply.status(500).send({ message: "Failed to get deliveries" });
      }
    }
  );

  // Update order status (admin only)
  fastify.put(
    "/orders/:id/status",
    { preHandler: shouldBeAdmin },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { status } = request.body as { status: string };

      try {
        const order = await Order.findByIdAndUpdate(
          id,
          { status },
          { new: true }
        );

        if (!order) {
          return reply.status(404).send({ message: "Order not found" });
        }

        // Optional: Trigger Kafka event for status change notification

        return reply.send(order);
      } catch (error) {
        console.error("Update order status error:", error);
        return reply.status(500).send({ message: "Failed to update order status" });
      }
    }
  );

  // Get single order by ID (Admin)
  fastify.get(
    "/orders/:id",
    { preHandler: shouldBeAdmin },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      try {
        const order = await Order.findById(id);
        if (!order) {
          return reply.status(404).send({ message: "Order not found" });
        }
        return reply.send(order);
      } catch (error) {
        console.error("Get order error:", error);
        return reply.status(500).send({ message: "Failed to get order" });
      }
    }
  );

  // Delete order (admin only)
  fastify.delete(
    "/orders/:id",
    { preHandler: shouldBeAdmin },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      try {
        console.log(`🗑️ Deleting order: ${id}`);
        const order = await Order.findByIdAndDelete(id);

        if (!order) {
          return reply.status(404).send({ message: "Order not found" });
        }

        console.log(`✅ Order deleted: ${id}`);
        return reply.send({ message: "Order deleted successfully", orderId: id });
      } catch (error) {
        console.error("Delete order error:", error);
        return reply.status(500).send({ message: "Failed to delete order" });
      }
    }
  );
};

export default orderRoute;

