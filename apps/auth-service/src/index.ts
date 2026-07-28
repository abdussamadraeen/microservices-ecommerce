import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { shouldBeAdmin, shouldBeUser } from "./middleware/authMiddleware.js";
import userRoute from "./routes/user.route.js";
import { producer } from "./utils/kafka.js";

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:3500",
      "http://localhost:3501",
      "http://localhost:3000",
      "http://127.0.0.1:3500",
      "http://127.0.0.1:3501",
      "http://127.0.0.1:3000",
      /\.vercel\.app$/,
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(clerkMiddleware());

app.get("/", (req: Request, res: Response) => {
  return res.status(200).json({
    service: "auth-service",
    version: "1.0.0",
    status: "running",
    port: 8003,
    endpoints: {
      health: "/health",
      users: "/users",
    },
  });
});

app.get("/health", (req: Request, res: Response) => {
  return res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

// app.use("/users", shouldBeUser, userRoute);
app.use("/users", shouldBeAdmin, userRoute);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  return res
    .status(err.status || 500)
    .json({ message: err.message || "Inter Server Error!" });
});

const start = async () => {
  try {
    // Start server first
    const port = process.env.PORT || 8003;
    app.listen(port, () => {
      console.log(`Auth service is running on ${port}`);
    });

    // Connect to Kafka in background (non-blocking)
    producer.connect()
      .then(() => console.log("Kafka producer connected"))
      .catch((err) => console.log("Kafka connection failed (service will continue):", err.message));
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();

