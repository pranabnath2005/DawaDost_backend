import express from "express";

import Product from "../models/Product.js";
import User from "../models/User.js";
import Order from "../models/Order.js";

const router = express.Router();

// ✅ Dashboard Stats
router.get("/stats", async (req, res) => {
    try {
        // Total Products
        const totalProducts = await Product.countDocuments();

        // Total Users
        const totalUsers = await User.countDocuments();

        // Total Orders
        const totalOrders = await Order.countDocuments();

        // Total Revenue
        const orders = await Order.find();

        const totalRevenue = orders.reduce(
            (acc, item) => acc + (item.finalAmount || 0),
            0
        );

        res.json({
            totalProducts,
            totalUsers,
            totalOrders,
            totalRevenue,
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// ✅ Dashboard Analytics
router.get("/sales", async (req, res) => {
    try {

        // Fetch Data
        const orders = await Order.find();
        const users = await User.find();
        const products = await Product.find();

        // Month Structure
        const analyticsData = [
            { name: "Jan", revenue: 0, orders: 0, users: 0, products: 0, sales: 0 },
            { name: "Feb", revenue: 0, orders: 0, users: 0, products: 0, sales: 0 },
            { name: "Mar", revenue: 0, orders: 0, users: 0, products: 0, sales: 0 },
            { name: "Apr", revenue: 0, orders: 0, users: 0, products: 0, sales: 0 },
            { name: "May", revenue: 0, orders: 0, users: 0, products: 0, sales: 0 },
            { name: "Jun", revenue: 0, orders: 0, users: 0, products: 0, sales: 0 },
            { name: "Jul", revenue: 0, orders: 0, users: 0, products: 0, sales: 0 },
            { name: "Aug", revenue: 0, orders: 0, users: 0, products: 0, sales: 0 },
            { name: "Sep", revenue: 0, orders: 0, users: 0, products: 0, sales: 0 },
            { name: "Oct", revenue: 0, orders: 0, users: 0, products: 0, sales: 0 },
            { name: "Nov", revenue: 0, orders: 0, users: 0, products: 0, sales: 0 },
            { name: "Dec", revenue: 0, orders: 0, users: 0, products: 0, sales: 0 },
        ];

        // ✅ Orders + Revenue + Sales
        orders.forEach((order) => {

            if (!order.createdAt) return;

            const month = new Date(order.createdAt).getMonth();

            analyticsData[month].orders += 1;

            analyticsData[month].revenue += Number(order.finalAmount || 0);

            analyticsData[month].sales += Number(order.finalAmount || 0);
        });

        // ✅ Users Analytics
        users.forEach((user) => {

            if (!user.createdAt) return;

            const month = new Date(user.createdAt).getMonth();

            analyticsData[month].users += 1;
        });

        // ✅ Products Analytics
        products.forEach((product) => {

            if (!product.createdAt) return;

            const month = new Date(product.createdAt).getMonth();

            analyticsData[month].products += 1;
        });

        // ✅ Send Response
        res.json(analyticsData);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

export default router;