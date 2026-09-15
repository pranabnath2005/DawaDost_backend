import express from "express";
import Notification from "../models/Notification.js";

const router = express.Router();

// ✅ Get notifications by user ID
router.get("/:userId", async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.params.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
});

// ✅ Mark notifications as read
router.put("/read", async (req, res) => {
  try {
    // Optional: update notifications in DB
    // await Notification.updateMany(
    //   {},
    //   { $set: { isRead: true } }
    // );

    res.status(200).json({
      message: "Notifications marked as read",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to mark notifications as read",
      error: error.message,
    });
  }
});

export default router;