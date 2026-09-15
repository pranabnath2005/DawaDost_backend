import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "../config/db.js";

// Routes
import authRoutes from "../routes/AuthRoutes.js";
import adminRoutes from "../routes/adminRoutes.js";
import notificationRoutes from "../routes/notificationRoutes.js";
import productRoutes from "../routes/productRoutes.js";
import categoryRoutes from "../routes/categoryRoutes.js";
import userRoutes from "../routes/userRoutes.js";
import orderRoutes from "../routes/orderRoutes.js";
import dashboardRoutes from "../routes/dashboardRoutes.js";

dotenv.config();

const app = express();

// Connect MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://YOUR-FRONTEND-DOMAIN.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Test route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "DawaDost API is running successfully 🚀",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Request payload is too large",
    });
  }

  res.status(500).json({
    success: false,
    message: "Something went wrong!",
  });
});

// IMPORTANT:
// Do NOT use app.listen() on Vercel.

export default app;