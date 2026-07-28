import sendMail from "./utils/mailer.js";
import { createConsumer, createKafkaClient } from "@repo/kafka";
import http from "node:http";

const kafka = createKafkaClient("email-service");
const consumer = createConsumer(kafka, "email-service");

const getPaymentMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    stripe: "Credit/Debit Card (Stripe)",
    razorpay: "Razorpay",
    upi: "UPI",
    qr: "UPI QR Code",
    cod: "Cash on Delivery",
  };
  return labels[method] || method;
};

const start = async () => {
  // Start HTTP server for Render health checks
  const server = http.createServer((req, res) => {
    if (req.url === "/health" || req.url === "/") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", service: "email-service" }));
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  const port = process.env.PORT || 8003;
  server.listen(port, () => {
    console.log(`Email service listening on port ${port}`);
  });

  try {
    await consumer.connect();
    await consumer.subscribe([
      {
        topicName: "user.created",
        topicHandler: async (message) => {
          const payload = message.value || message;
          const { email, username } = payload;

          if (email) {
            await sendMail({
              email,
              subject: "Welcome to Xiaomi India! 🎉",
              text: `Welcome ${username}!\n\nYour account has been created successfully.\n\nStart shopping at Xiaomi India for the best smartphones, accessories, and smart home devices.\n\nThank you for choosing Xiaomi!`,
            });
          }
        },
      },
      {
        topicName: "order.created",
        topicHandler: async (message) => {
          const payload = message.value || message;
          const { email, orderId, amount, status, products, shippingAddress, paymentMethod } = payload;

          if (email) {
            const productList = products?.map((p: any) =>
              `• ${p.name} (Qty: ${p.quantity}) - ₹${p.price}`
            ).join("\n") || "Products info not available";

            const emailText = `
🎉 Order Placed Successfully!

Hi ${shippingAddress?.name || "Customer"},

Thank you for shopping with Xiaomi India! Your order has been confirmed.

📦 ORDER DETAILS
━━━━━━━━━━━━━━━━━━━━━━
Order ID: ${orderId}
Order Status: ${status === "pending" ? "Pending (COD)" : "Confirmed"}
Payment Method: ${getPaymentMethodLabel(paymentMethod)}

🛒 ITEMS ORDERED
━━━━━━━━━━━━━━━━━━━━━━
${productList}

💰 TOTAL: ₹${(amount / 100).toLocaleString("en-IN")}

📍 DELIVERY ADDRESS
━━━━━━━━━━━━━━━━━━━━━━
${shippingAddress?.name || ""}
${shippingAddress?.address || ""}
${shippingAddress?.city || ""}
Phone: ${shippingAddress?.phone || ""}

📅 Expected Delivery: 5-7 business days

${paymentMethod === "cod" ? "💵 Please keep ₹" + (amount / 100).toLocaleString("en-IN") + " ready at the time of delivery.\n" : ""}
Track your order at: https://mi.com/orders

Thank you for choosing Xiaomi India! 🙏

Best regards,
Xiaomi India Team
━━━━━━━━━━━━━━━━━━━━━━
For support: support@mi.com | 1800-103-6286
            `.trim();

            await sendMail({
              email,
              subject: `✅ Order Confirmed - #${orderId?.toString().slice(-8).toUpperCase()} | Xiaomi India`,
              text: emailText,
            });
            console.log("Order confirmation email sent to:", email);
          }
        },
      },
    ]);
  } catch (error) {
    console.log(error);
  }
};

start();
