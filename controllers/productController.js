const Product = require("../models/Product"); // Path to your Mongoose Product Model

/**
 * @desc    Get all products with optional brand query filtering
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res) => {
  try {
    const { brand } = req.query;
    let query = {};

    if (brand) {
      // 1. Clean up incoming query string to create a flexible matching string
      // Example: 'dr-reddys' or "Dr. Reddy's" becomes a uniform search pattern
      const cleanBrandQuery = brand
        .trim()
        .replace(/[-\s]+/g, ".*")  // Converts spaces and dashes to wildcards
        .replace(/['’.]/g, "");     // Strips periods and apostrophes for raw matching

      // 2. Build a flexible regular expression
      // This will match "Dr. Reddy's" even if the parameter sent was "dr-reddys"
      query.brand = { 
        $regex: new RegExp(`^${cleanBrandQuery}$`, "i") 
      };
    }

    // Fetch matching documents from database sorted by newest first
    const products = await Product.find(query).sort({ createdAt: -1 });

    // Return results to frontend
    return res.status(200).json(products);

  } catch (error) {
    console.error("Error inside getProducts controller:", error);
    return res.status(500).json({ 
      success: false,
      message: "Server error while fetching product data registry.",
      error: error.message 
    });
  }
};

/**
 * @desc    Create / Add a new product to inventory
 * @route   POST /api/products
 * @access  Private/Admin
 */
const createProduct = async (req, res) => {
  try {
    const { name, brand, price, discountPrice, stock, category, description, image } = req.body;

    // Basic Validation
    if (!name || !brand || !price) {
      return res.status(400).json({ message: "Name, Brand, and Price are required fields." });
    }

    const newProduct = new Product({
      name,
      brand: brand.trim(), // Saves the exact name typed in Admin input (e.g., "Dr. Reddy's")
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      stock: stock ? Number(stock) : 0,
      category,
      description,
      image
    });

    const savedProduct = await newProduct.save();
    return res.status(201).json({
      success: true,
      message: "Product provisioned successfully!",
      product: savedProduct
    });

  } catch (error) {
    console.error("Error inside createProduct controller:", error);
    return res.status(500).json({ 
      success: false,
      message: "Failed to upload product schema.",
      error: error.message 
    });
  }
};

module.exports = {
  getProducts,
  createProduct
};