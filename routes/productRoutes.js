import express from "express";
import multer from "multer";
import Product from "../models/Product.js";

const router = express.Router();

const normalizeSlug = (value = "") =>
  value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/["'’‘.`]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
/* =========================
   MULTER CONFIG
========================= */

const storage = multer.memoryStorage();

const upload = multer({
  storage,
});

/* =========================
   GET ALL PRODUCTS
========================= */

router.get("/", async (req, res) => {

  try {

    // BRAND FILTER
    // Example:
    // /api/products?brand=cipla

    if (req.query.brand) {

      const products =
        await Product.find({
          brandSlug:
            normalizeSlug(req.query.brand),
        }).sort({
          createdAt: -1,
        });

      return res.json(products);
    }

    // ALL PRODUCTS

    const products =
      await Product.find().sort({
        createdAt: -1,
      });

    res.json(products);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message:
        error.message,
    });
  }
});

/* =========================
   GET FEATURED BRANDS
========================= */

router.get("/brands", async (req, res) => {

  try {

    const brands =
      await Product.aggregate([
        {
          $group: {

            _id: "$brandSlug",

            brand: {
              $first: "$brand",
            },

            brandSlug: {
              $first: "$brandSlug",
            },

            brandLogo: {
              $first: "$brandLogo",
            },
          },
        },

        {
          $sort: {
            brand: 1,
          },
        },
      ]);

    res.json(brands);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message:
        error.message,
    });
  }
});

/* =========================
   GET PRODUCTS BY BRAND
========================= */

router.get(
  "/brand/:brandSlug",

  async (req, res) => {

    try {

      const raw = req.params.brandSlug || "";
      const brandSlug = normalizeSlug(raw);

      // Build a resilient regex: escape special chars, allow punctuation/whitespace where hyphens were
      const escaped = raw.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const pattern = escaped.replace(/-/g, "[\\s\\W_]*");
      const brandRegex = new RegExp(`^${pattern}$`, "i");

      const products =
        await Product.find({
          $or: [
            { brandSlug },
            { brand: brandRegex },
          ],
        }).sort({
          createdAt: -1,
        });

      res.json(products);

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          error.message,
      });
    }
  }
);

/* =========================
   GET SINGLE PRODUCT
========================= */

router.get(
  "/:id",

  async (req, res) => {

    try {

      const product =
        await Product.findById(
          req.params.id
        );

      if (!product) {

        return res.status(404).json({
          message:
            "Product not found",
        });
      }

      res.json(product);

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          error.message,
      });
    }
  }
);

/* =========================
   ADD PRODUCT
========================= */

router.post(
  "/",

  upload.single("image"),

  async (req, res) => {

    try {

      let imageUrl = "";

      // IMAGE

      if (req.file) {

        imageUrl =
          `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      }

      // CREATE PRODUCT

      const newProduct =
        new Product({

          productId:
            req.body.productId,

          name:
            req.body.name,

          brand:
            req.body.brand,

          brandSlug:
            normalizeSlug(req.body.brandSlug || req.body.brand),

          brandLogo:
            req.body.brandLogo,

          type:
            req.body.type,

          category:
            req.body.category,

          price:
            Number(req.body.price) || 0,

          discountPrice:
            req.body.discountPrice ? Number(req.body.discountPrice) : undefined,

          stock:
            Number(req.body.stock) || 0,

          delivery:
            req.body.delivery,

          description:
            req.body.description,

          image:
            imageUrl,
        });

      await newProduct.save();

      res.status(201).json({
        success: true,
        message:
          "Product Added Successfully",
        product:
          newProduct,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  }
);

/* =========================
   UPDATE PRODUCT
========================= */

router.put(
  "/:id",

  upload.single("image"),

  async (req, res) => {

    try {

      const updatedData = {

        productId:
          req.body.productId,

        name:
          req.body.name,

        brand:
          req.body.brand,

          brandSlug:
          normalizeSlug(req.body.brandSlug || req.body.brand),

        brandLogo:
          req.body.brandLogo,

        type:
          req.body.type,

        category:
          req.body.category,

        price:
          Number(req.body.price) || 0,

        discountPrice:
          req.body.discountPrice ? Number(req.body.discountPrice) : undefined,

        stock:
          Number(req.body.stock) || 0,

        delivery:
          req.body.delivery,

        description:
          req.body.description,
      };

      // NEW IMAGE

      if (req.file) {

        updatedData.image =
          `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      }

      const updatedProduct =
        await Product.findByIdAndUpdate(
          req.params.id,
          updatedData,
          {
            new: true,
          }
        );

      res.json({
        success: true,
        message:
          "Product Updated",
        product:
          updatedProduct,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  }
);

/* =========================
   DELETE PRODUCT
========================= */

router.delete(
  "/:id",

  async (req, res) => {

    try {

      await Product.findByIdAndDelete(
        req.params.id
      );

      res.json({
        success: true,
        message:
          "Product Deleted",
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  }
);

/* =========================
   ONE-TIME MIGRATION: NORMALIZE EXISTING BRAND SLUGS
   Call this endpoint once to update existing products' brandSlug
   to the normalized form (e.g. "Dr. Reddy's" -> "dr-reddys").
*/
router.post('/migrate/normalize-brand-slugs', async (req, res) => {
  try {
    const products = await Product.find();

    const ops = products.map((p) => {
      const normalized = normalizeSlug(p.brand || p.brandSlug || '');
      if (p.brandSlug !== normalized) {
        return {
          updateOne: {
            filter: { _id: p._id },
            update: { $set: { brandSlug: normalized } },
          },
        };
      }
      return null;
    }).filter(Boolean);

    if (ops.length === 0) {
      return res.json({ success: true, message: 'No changes needed' });
    }

    await Product.bulkWrite(ops);

    res.json({ success: true, message: `Updated ${ops.length} products` });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;