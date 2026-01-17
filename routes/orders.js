// routes/orders.js - Updated with admin routes
const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const authMiddleware = require("../middleware/auth");

// Place order (JWT protected)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { items, total } = req.body;

    const order = new Order({
      user_id: req.user.userId,
      items,
      total,
      status: "Placed",
    });
    await order.save();

    // Mock payment
    const payment = new Payment({
      order_id: order._id,
      transaction_id: "TXN" + Date.now(),
      amount: total,
    });
    await payment.save();

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get order history for logged-in user
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user.userId }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get all orders (Admin only)
router.get("/all", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update order status (Admin only)
router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;