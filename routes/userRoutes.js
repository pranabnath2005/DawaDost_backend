import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import Cart from "../models/Cart.js";

import {
  uploadProfile,
} from "../middlewares/Upload.js";

const router = express.Router();

// ======================================================
// AUTH MIDDLEWARE
// ======================================================
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No authorization header",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.userId = decoded.id || decoded.userId;

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in token",
      });
    }

    next();

  } catch (error) {
    console.error("TOKEN ERROR:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};


// ======================================================
// CART ROUTES
// ======================================================

// ======================================================
// GET USER CART
// GET /api/users/cart
// ======================================================
router.get("/cart", verifyToken, async (req, res) => {
  try {

    let cart = await Cart.findOne({
      userId: req.userId,
    });

    // Create cart if it doesn't exist
    if (!cart) {
      cart = new Cart({
        userId: req.userId,
        items: [],
      });

      await cart.save();
    }

    return res.status(200).json({
      success: true,
      items: cart.items,
      cart,
    });

  } catch (error) {

    console.error("GET CART ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// ======================================================
// ADD ITEM TO CART
// POST /api/users/cart
// ======================================================
router.post("/cart", verifyToken, async (req, res) => {
  try {

    const {
      productId,
      name,
      price,
      image,
      quantity = 1,
    } = req.body;

    // Validate product
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Product name is required",
      });
    }

    if (price === undefined || price === null) {
      return res.status(400).json({
        success: false,
        message: "Product price is required",
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    let cart = await Cart.findOne({
      userId: req.userId,
    });

    if (!cart) {
      cart = new Cart({
        userId: req.userId,
        items: [],
      });
    }

    const existingItemIndex =
      cart.items.findIndex(
        (item) =>
          item.productId.toString() ===
          productId.toString()
      );

    if (existingItemIndex !== -1) {

      cart.items[
        existingItemIndex
      ].quantity += Number(quantity);

    } else {

      cart.items.push({
        productId,
        name,
        price: Number(price),
        image: image || "",
        quantity: Number(quantity),
      });
    }

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart,
    });

  } catch (error) {

    console.error("ADD CART ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// ======================================================
// SYNC ENTIRE CART
// POST /api/users/cart/sync
// ======================================================
router.post(
  "/cart/sync",
  verifyToken,
  async (req, res) => {

    try {

      const { items } = req.body;

      console.log(
        "================================"
      );

      console.log(
        "CART SYNC REQUEST"
      );

      console.log(
        "USER ID:",
        req.userId
      );

      console.log(
        "ITEMS:",
        items
      );

      console.log(
        "================================"
      );


      // Validate items
      if (!Array.isArray(items)) {
        return res.status(400).json({
          success: false,
          message:
            "Cart items must be an array",
        });
      }


      // Validate each item
      for (const item of items) {

        if (!item.productId) {
          return res.status(400).json({
            success: false,
            message:
              "Product ID is missing",
          });
        }

        if (!item.name) {
          return res.status(400).json({
            success: false,
            message:
              "Product name is missing",
          });
        }

        if (
          item.price === undefined ||
          item.price === null
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Product price is missing",
          });
        }

        if (
          !item.quantity ||
          Number(item.quantity) < 1
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid product quantity",
          });
        }
      }


      // Find user's cart
      let cart = await Cart.findOne({
        userId: req.userId,
      });


      // Create cart if not found
      if (!cart) {

        cart = new Cart({
          userId: req.userId,
          items: [],
        });
      }


      // Replace cart items
      cart.items = items.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: Number(item.price),
        image: item.image || "",
        quantity: Number(item.quantity),
      }));


      // Save cart
      await cart.save();


      console.log(
        "CART SAVED SUCCESSFULLY"
      );

      console.log(
        "CART ID:",
        cart._id
      );

      console.log(
        "CART ITEMS:",
        cart.items
      );


      return res.status(200).json({
        success: true,
        message:
          "Cart synced successfully",
        items: cart.items,
        cart,
      });

    } catch (error) {

      console.error(
        "================================"
      );

      console.error(
        "CART SYNC ERROR:",
        error
      );

      console.error(
        "================================"
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);


// ======================================================
// UPDATE CART QUANTITY
// PUT /api/users/cart/:productId
// ======================================================
router.put(
  "/cart/:productId",
  verifyToken,
  async (req, res) => {

    try {

      const {
        quantity,
      } = req.body;

      const {
        productId,
      } = req.params;


      if (quantity === undefined) {
        return res.status(400).json({
          success: false,
          message:
            "Quantity is required",
        });
      }


      const cart =
        await Cart.findOne({
          userId: req.userId,
        });


      if (!cart) {
        return res.status(404).json({
          success: false,
          message:
            "Cart not found",
        });
      }


      const itemIndex =
        cart.items.findIndex(
          (item) =>
            item.productId.toString() ===
            productId.toString()
        );


      if (itemIndex === -1) {
        return res.status(404).json({
          success: false,
          message:
            "Item not found in cart",
        });
      }


      if (Number(quantity) <= 0) {

        cart.items.splice(
          itemIndex,
          1
        );

      } else {

        cart.items[
          itemIndex
        ].quantity =
          Number(quantity);
      }


      await cart.save();


      return res.status(200).json({
        success: true,
        message:
          "Cart updated",
        cart,
      });

    } catch (error) {

      console.error(
        "UPDATE CART ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);


// ======================================================
// REMOVE CART ITEM
// DELETE /api/users/cart/:productId
// ======================================================
router.delete(
  "/cart/:productId",
  verifyToken,
  async (req, res) => {

    try {

      const {
        productId,
      } = req.params;


      const cart =
        await Cart.findOne({
          userId: req.userId,
        });


      if (!cart) {
        return res.status(404).json({
          success: false,
          message:
            "Cart not found",
        });
      }


      cart.items =
        cart.items.filter(
          (item) =>
            item.productId.toString() !==
            productId.toString()
        );


      await cart.save();


      return res.status(200).json({
        success: true,
        message:
          "Product removed",
        cart,
      });

    } catch (error) {

      console.error(
        "REMOVE CART ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);


// ======================================================
// CLEAR CART
// DELETE /api/users/cart
// ======================================================
router.delete(
  "/cart",
  verifyToken,
  async (req, res) => {

    try {

      const cart =
        await Cart.findOne({
          userId: req.userId,
        });


      if (!cart) {
        return res.status(200).json({
          success: true,
          message:
            "Cart already empty",
          items: [],
        });
      }


      cart.items = [];

      await cart.save();


      return res.status(200).json({
        success: true,
        message:
          "Cart cleared",
        items: [],
        cart,
      });

    } catch (error) {

      console.error(
        "CLEAR CART ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);


// ======================================================
// WISHLIST
// ======================================================

router.get(
  "/wishlist",
  verifyToken,
  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.userId
        );


      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
          wishlist: [],
        });
      }


      return res.status(200).json(
        user.wishlist || []
      );

    } catch (error) {

      console.error(
        "WISHLIST FETCH ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);


// ======================================================
// ADD WISHLIST
// ======================================================

router.post(
  "/wishlist",
  verifyToken,
  async (req, res) => {

    try {

      const {
        productId,
        name,
        price,
        image,
      } = req.body;


      if (!productId) {
        return res.status(400).json({
          success: false,
          message:
            "Product ID is required",
        });
      }


      const user =
        await User.findById(
          req.userId
        );


      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }


      if (!user.wishlist) {
        user.wishlist = [];
      }


      const exists =
        user.wishlist.some(
          (item) =>
            item.productId.toString() ===
            productId.toString()
        );


      if (!exists) {

        user.wishlist.push({
          productId,
          name,
          price,
          image,
        });

        await user.save();
      }


      return res.status(200).json(
        user.wishlist
      );

    } catch (error) {

      console.error(
        "ADD WISHLIST ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);


// ======================================================
// REMOVE WISHLIST
// ======================================================

router.delete(
  "/wishlist/:productId",
  verifyToken,
  async (req, res) => {

    try {

      const {
        productId,
      } = req.params;


      const user =
        await User.findById(
          req.userId
        );


      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }


      if (!user.wishlist) {
        return res.json([]);
      }


      user.wishlist =
        user.wishlist.filter(
          (item) =>
            item.productId.toString() !==
            productId.toString()
        );


      await user.save();


      return res.status(200).json(
        user.wishlist
      );

    } catch (error) {

      console.error(
        "REMOVE WISHLIST ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);


// ======================================================
// PROFILE UPLOAD
// ======================================================

router.put(
  "/profile/upload",
  verifyToken,
  uploadProfile.single("profilePic"),
  async (req, res) => {

    try {

      console.log(
        "FILE =",
        req.file
      );

      console.log(
        "USER ID =",
        req.userId
      );


      if (!req.file) {
        return res.status(400).json({
          success: false,
          message:
            "No file uploaded",
        });
      }


      const user =
        await User.findById(
          req.userId
        );


      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }


      user.profilePic =
        req.file.path;

      await user.save();


      return res.status(200).json({
        success: true,
        profilePic:
          req.file.path,
      });

    } catch (error) {

      console.error(
        "UPLOAD ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);


// ======================================================
// UPDATE PROFILE
// ======================================================

router.put(
  "/profile/update",
  verifyToken,
  async (req, res) => {

    try {

      console.log(
        "BODY:",
        req.body
      );

      console.log(
        "USER ID:",
        req.userId
      );


      const {
        email,
        firstName,
        lastName,
        phone,
        gender,
        houseName,
        landmark,
        district,
        state,
        pincode,
        country,
      } = req.body;


      const user =
        await User.findById(
          req.userId
        );


      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }


      const updateData = {};


      if (
        email !== undefined &&
        email !== user.email
      ) {

        const existingEmailUser =
          await User.findOne({
            email,
          });


        if (
          existingEmailUser
        ) {
          return res.status(400).json({
            success: false,
            message:
              "This email is already in use.",
          });
        }


        updateData.email = email;
      }


      if (
        firstName !== undefined
      ) {
        updateData.firstName =
          firstName;
      }


      if (
        lastName !== undefined
      ) {
        updateData.lastName =
          lastName;
      }


      if (
        phone !== undefined
      ) {
        updateData.phone =
          phone;
      }


      if (
        gender !== undefined
      ) {
        updateData.gender =
          gender;
      }


      updateData.name =
        `${firstName || user.firstName || ""} ${
          lastName || user.lastName || ""
        }`.trim();


      updateData.address = {
        houseName:
          houseName ||
          user.address?.houseName ||
          "",

        landmark:
          landmark ||
          user.address?.landmark ||
          "",

        district:
          district ||
          user.address?.district ||
          "",

        state:
          state ||
          user.address?.state ||
          "",

        pincode:
          pincode ||
          user.address?.pincode ||
          "",

        country:
          country ||
          user.address?.country ||
          "",
      };


      const updatedUser =
        await User.findByIdAndUpdate(
          req.userId,
          updateData,
          {
            new: true,
          }
        );


      return res.status(200).json({
        success: true,
        message:
          "Profile updated successfully",
        user: updatedUser,
      });

    } catch (error) {

      console.error(
        "UPDATE PROFILE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);


// ======================================================
// GET PROFILE
// ======================================================

router.get(
  "/profile",
  verifyToken,
  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.userId
        );


      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }


      return res.status(200).json({
        success: true,
        user,
      });

    } catch (error) {

      console.error(
        "GET PROFILE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);


// ======================================================
// UPDATE PASSWORD
// ======================================================

router.put(
  "/profile/password",
  verifyToken,
  async (req, res) => {

    try {

      const {
        currentPassword,
        newPassword,
      } = req.body;


      if (
        !currentPassword ||
        !newPassword
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Current and new password are required.",
        });
      }


      const user =
        await User.findById(
          req.userId
        ).select("+password");


      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found.",
        });
      }


      const isMatch =
        await bcrypt.compare(
          currentPassword,
          user.password
        );


      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message:
            "Current password is incorrect.",
        });
      }


      user.password =
        await bcrypt.hash(
          newPassword,
          10
        );

      await user.save();


      return res.status(200).json({
        success: true,
        message:
          "Password updated successfully.",
      });

    } catch (error) {

      console.error(
        "PASSWORD UPDATE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);


// ======================================================
// EXPORT
// ======================================================

export default router;