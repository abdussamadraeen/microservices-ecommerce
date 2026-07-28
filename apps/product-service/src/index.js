import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { shouldBeUser } from "./middleware/authMiddleware.js";
import productRouter from "./routes/product.route";
import categoryRouter from "./routes/category.route";
import bannerRouter from "./routes/banner.route";
import settingsRouter from "./routes/settings.route";
import ecosystemRouter from "./routes/ecosystem.route";
import { consumer, producer } from "./utils/kafka.js";
const app = express();
app.use(cors({
    origin: ["http://localhost:3500", "http://localhost:3501", "http://localhost:3000"],
    credentials: true,
}));
app.use(express.json({ limit: "50mb" }));
app.use(clerkMiddleware());
app.get("/", (req, res) => {
    return res.status(200).json({
        service: "product-service",
        version: "1.0.0",
        status: "running",
        port: 8000,
        endpoints: {
            health: "/health",
            products: "/products",
            categories: "/categories",
            banners: "/banners",
        },
    });
});
app.get("/health", (req, res) => {
    return res.status(200).json({
        status: "ok",
        uptime: process.uptime(),
        timestamp: Date.now(),
    });
});
app.get("/test", shouldBeUser, (req, res) => {
    res.json({ message: "Product service authenticated", userId: req.userId });
});
app.use("/products", productRouter);
app.use("/categories", categoryRouter);
app.use("/banners", bannerRouter);
app.use("/settings", settingsRouter);
app.use("/ecosystem", ecosystemRouter);
app.use((err, req, res, next) => {
    console.log(err);
    return res
        .status(err.status || 500)
        .json({ message: err.message || "Inter Server Error!" });
});
const start = async () => {
    try {
        // Start server first, then connect to Kafka
        const port = process.env.PORT || 8000;
        app.listen(port, () => {
            console.log(`Product service is running on ${port}`);
        });
        // Connect to Kafka in background (non-blocking)
        Promise.all([producer.connect(), consumer.connect()])
            .then(() => console.log("Kafka connected successfully"))
            .catch((err) => console.log("Kafka connection failed (service will continue):", err.message));
    }
    catch (error) {
        console.log(error);
        process.exit(1);
    }
};
start();
