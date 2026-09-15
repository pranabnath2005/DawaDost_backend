import express from "express";
import jwt from "jsonwebtoken";

import Order from "../models/Order.js";
import Cart from "../models/Cart.js";

const router = express.Router();

// ======================================================
// VERIFY TOKEN
// ======================================================
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header is missing",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Support either id or userId in JWT
    req.userId =
      decoded.id ||
      decoded.userId ||
      decoded._id;

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in token",
      });
    }

    next();
  } catch (error) {
    console.error("JWT ERROR:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};


// ======================================================
// GET ALL ORDERS - ADMIN
// GET /api/orders/admin
// ======================================================
router.get(
  "/admin",
  async (req, res) => {
    try {
      const orders = await Order.find()
        .populate("userId", "name email")
        .sort({
          createdAt: -1,
        });

      return res.status(200).json(
        orders
      );
    } catch (error) {
      console.error(
        "ADMIN ORDERS ERROR:",
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
// GET USER ORDERS - ADMIN
// GET /api/orders/admin/user/:userId
// ======================================================
router.get(
  "/admin/user/:userId",
  async (req, res) => {
    try {
      const orders =
        await Order.find({
          userId:
            req.params.userId,
        }).sort({
          createdAt: -1,
        });

      return res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      console.error(
        "USER ORDERS ERROR:",
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
// GET LOGGED-IN USER ORDERS
// GET /api/orders
// ======================================================
router.get(
  "/",
  verifyToken,
  async (req, res) => {
    try {
      console.log(
        "GET ORDERS USER:",
        req.userId
      );

      const orders =
        await Order.find({
          userId: req.userId,
        }).sort({
          createdAt: -1,
        });

      return res.status(200).json(
        orders
      );
    } catch (error) {
      console.error(
        "GET USER ORDERS ERROR:",
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
// GET SINGLE ORDER
// GET /api/orders/:orderId
// ======================================================
router.get(
  "/:orderId",
  verifyToken,
  async (req, res) => {
    try {
      const order =
        await Order.findOne({
          _id: req.params.orderId,
          userId: req.userId,
        });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      return res.status(200).json(
        order
      );
    } catch (error) {
      console.error(
        "GET SINGLE ORDER ERROR:",
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
// CREATE ORDER
// POST /api/orders
// ======================================================
router.post(
  "/",
  verifyToken,
  async (req, res) => {
    try {
      console.log(
        "======================================"
      );

      console.log(
        "CREATE ORDER REQUEST"
      );

      console.log(
        "USER ID:",
        req.userId
      );

      console.log(
        "BODY:",
        JSON.stringify(
          req.body,
          null,
          2
        )
      );

      console.log(
        "======================================"
      );


      // ==================================================
      // GET REQUEST DATA
      // ==================================================

      const {
        shippingAddress,
        paymentMethod,
        discountApplied = 0,
      } = req.body;


      // ==================================================
      // VALIDATE SHIPPING ADDRESS
      // ==================================================

      if (!shippingAddress) {
        return res.status(400).json({
          success: false,
          message:
            "Shipping address is required",
        });
      }


      const requiredAddressFields = [
        "fullName",
        "phone",
        "address",
        "city",
        "state",
        "pincode",
      ];


      for (
        const field of requiredAddressFields
      ) {
        if (
          !shippingAddress[field] ||
          String(
            shippingAddress[field]
          ).trim() === ""
        ) {
          return res.status(400).json({
            success: false,
            message:
              `${field} is required`,
          });
        }
      }


      // ==================================================
      // VALIDATE PAYMENT METHOD
      // ==================================================

      if (
        !paymentMethod ||
        !["cod", "online"].includes(
          paymentMethod
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid payment method",
        });
      }


      // ==================================================
      // FIND USER CART
      // ==================================================

      console.log(
        "SEARCHING CART FOR USER:",
        req.userId
      );

      const cart =
        await Cart.findOne({
          userId: req.userId,
        });


      console.log(
        "CART FOUND:",
        cart
      );


      // ==================================================
      // CHECK CART
      // ==================================================

      if (!cart) {
        return res.status(400).json({
          success: false,
          message:
            "Cart not found for this user",
        });
      }


      if (
        !Array.isArray(cart.items) ||
        cart.items.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Cart is empty",
        });
      }


      // ==================================================
      // VALIDATE CART ITEMS
      // ==================================================

      for (
        const item of cart.items
      ) {
        if (!item.productId) {
          return res.status(400).json({
            success: false,
            message:
              "Cart contains an invalid product",
          });
        }

        if (
          !item.name ||
          item.price === undefined ||
          !item.quantity
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Cart contains incomplete product information",
          });
        }

        if (
          Number(item.quantity) < 1
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Cart contains invalid quantity",
          });
        }
      }


      // ==================================================
      // CALCULATE TOTAL
      // ==================================================

      const totalAmount =
        cart.items.reduce(
          (total, item) => {
            return (
              total +
              Number(item.price) *
                Number(item.quantity)
            );
          },
          0
        );


      // ==================================================
      // DISCOUNT
      // ==================================================

      const discount =
        Math.max(
          0,
          Number(discountApplied) || 0
        );


      if (discount > totalAmount) {
        return res.status(400).json({
          success: false,
          message:
            "Discount cannot be greater than order total",
        });
      }


      // ==================================================
      // FINAL AMOUNT
      // ==================================================

      const finalAmount =
        totalAmount - discount;


      // ==================================================
      // DELIVERY DATE
      // ==================================================

      const deliveryDate =
        new Date(
          Date.now() +
            7 *
              24 *
              60 *
              60 *
              1000
        );


      // ==================================================
      // CREATE ORDER
      // ==================================================

      const order =
        new Order({
          userId: req.userId,

          items:
            cart.items.map(
              (item) => ({
                productId:
                  item.productId,

                name:
                  item.name,

                price:
                  Number(item.price),

                image:
                  item.image || "",

                quantity:
                  Number(item.quantity),
              })
            ),

          shippingAddress: {
            fullName:
              shippingAddress.fullName,

            phone:
              shippingAddress.phone,

            address:
              shippingAddress.address,

            city:
              shippingAddress.city,

            state:
              shippingAddress.state,

            pincode:
              shippingAddress.pincode,
          },

          paymentMethod,

          paymentStatus:
            paymentMethod === "cod"
              ? "pending"
              : "pending",

          orderStatus:
            "confirmed",

          trackingHistory: [
            {
              status:
                "confirmed",
              updatedAt:
                new Date(),
            },
          ],

          totalAmount,

          discountApplied:
            discount,

          deliveryDate,

          finalAmount,
        });


      // ==================================================
      // SAVE ORDER
      // ==================================================

      await order.save();


      console.log(
        "ORDER CREATED:",
        order._id
      );


      // ==================================================
      // CLEAR CART
      // ==================================================

      cart.items = [];

      await cart.save();


      console.log(
        "CART CLEARED AFTER ORDER"
      );


      // ==================================================
      // SUCCESS RESPONSE
      // ==================================================

      return res.status(201).json({
        success: true,
        message:
          "Order placed successfully",
        order,
      });


    } catch (error) {

      console.error(
        "======================================"
      );

      console.error(
        "CREATE ORDER ERROR:"
      );

      console.error(
        error
      );

      console.error(
        "MESSAGE:",
        error.message
      );

      console.error(
        "======================================"
      );


      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to place order",
      });
    }
  }
);


// ======================================================
// UPDATE ORDER STATUS - ADMIN
// PUT /api/orders/admin/:orderId/status
// ======================================================
router.put(
  "/admin/:orderId/status",
  async (req, res) => {
    try {
      const {
        orderStatus,
      } = req.body;


      const allowedStatuses = [
        "confirmed",
        "packed",
        "shipping",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ];


      if (
        !allowedStatuses.includes(
          orderStatus
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid order status",
        });
      }


      const order =
        await Order.findByIdAndUpdate(
          req.params.orderId,
          {
            orderStatus,
            $push: {
              trackingHistory: {
                status:
                  orderStatus,
                updatedAt:
                  new Date(),
              },
            },
          },
          {
            new: true,
            runValidators: true,
          }
        );


      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found",
        });
      }


      return res.status(200).json(
        order
      );

    } catch (error) {

      console.error(
        "UPDATE ORDER STATUS ERROR:",
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
// CANCEL ORDER
// PUT /api/orders/:orderId/cancel
// ======================================================
router.put(
  "/:orderId/cancel",
  verifyToken,
  async (req, res) => {
    try {

      const order =
        await Order.findOne({
          _id: req.params.orderId,
          userId: req.userId,
        });


      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found",
        });
      }


      if (
        [
          "shipping",
          "out_for_delivery",
          "delivered",
          "cancelled",
        ].includes(
          order.orderStatus
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This order cannot be cancelled",
        });
      }


      order.orderStatus =
        "cancelled";


      order.trackingHistory.push({
        status:
          "cancelled",
        updatedAt:
          new Date(),
      });


      await order.save();


      return res.status(200).json({
        success: true,
        message:
          "Order cancelled successfully",
        order,
      });

    } catch (error) {

      console.error(
        "CANCEL ORDER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);


export default router;