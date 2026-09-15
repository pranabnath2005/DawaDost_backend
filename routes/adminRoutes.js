import express from "express";
import { verifyToken, isAdmin } from "../middlewares/AuthMiddlewares.js";
import User from "../models/User.js";

const router = express.Router();

/* 🔐 ADMIN DASHBOARD API */
router.get("/admin/dashboard", verifyToken, isAdmin, (req, res) => {
  res.json({
    success: true,
    message: "Welcome Admin",
    admin: req.user,
  });
});

/* 🔐 ADMIN USERS LIST */
router.get("/users", verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, "name firstName lastName email role profilePic phone gender address createdAt").sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    console.error("Admin users fetch error:", error);
    res.status(500).json({ success: false, message: "Unable to load users" });
  }
});

export default router;
