import express from "express";
import Category from "../models/Category.js";

const router = express.Router();

// Add category
router.post("/", async (req, res) => {
  try {
    const category = new Category({
      name: req.body.name
    });

    const savedCategory = await category.save();
    res.json(savedCategory);
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ message: "Error adding category", error: error.message });
  }
});

// Get categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Error fetching categories", error: error.message });
  }
});

export default router;
