// routes/analytics.js - NEW ANALYTICS ROUTES
const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

// Helper function to get date range
const getDateRange = (range) => {
  const now = new Date();
  let startDate;

  if (range === "today") {
    startDate = new Date(now.setHours(0, 0, 0, 0));
  } else if (range === "7days") {
    startDate = new Date(now.setDate(now.getDate() - 7));
  } else {
    startDate = new Date(0); // All time
  }

  return startDate;
};

// GET /api/analytics/summary
router.get("/summary", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { dateRange = "7days" } = req.query;
    const startDate = getDateRange(dateRange);

    // Total Orders (in date range)
    const totalOrders = await Order.countDocuments({
      createdAt: { $gte: startDate },
    });

    // Total Revenue (in date range)
    const revenueResult = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Active Users (users who placed orders in date range)
    const activeUsers = await Order.distinct("user_id", {
      createdAt: { $gte: startDate },
    });

    // Order Status Breakdown
    const statusBreakdown = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const completed = statusBreakdown.find((s) => s._id === "Delivered")?.count || 0;
    const cancelled = 0; // Add cancelled status if implemented
    const placed = statusBreakdown.find((s) => s._id === "Placed")?.count || 0;
    const preparing = statusBreakdown.find((s) => s._id === "Preparing")?.count || 0;

    res.json({
      summary: {
        totalOrders,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        activeUsers: activeUsers.length,
      },
      orderStatus: {
        completed,
        cancelled,
        placed,
        preparing,
      },
    });
  } catch (error) {
    console.error("Analytics summary error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET /api/analytics/orders-chart
router.get("/orders-chart", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { dateRange = "7days" } = req.query;
    const startDate = getDateRange(dateRange);

    // Group orders by date
    const ordersOverTime = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
          revenue: { $sum: "$total" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format for chart
    const chartData = ordersOverTime.map((item) => ({
      date: item._id,
      orders: item.count,
      revenue: parseFloat(item.revenue.toFixed(2)),
    }));

    res.json({ chartData });
  } catch (error) {
    console.error("Analytics chart error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET /api/analytics/orders - Paginated orders list
router.get("/orders", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const {
      page = 1,
      limit = 10,
      status = "all",
      dateRange = "7days",
    } = req.query;

    const startDate = getDateRange(dateRange);
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    const query = { createdAt: { $gte: startDate } };
    if (status !== "all") {
      query.status = status;
    }

    // Get orders with pagination
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("user_id", "name email");

    // Get total count for pagination
    const totalOrders = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOrders / parseInt(limit)),
        totalOrders,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Analytics orders error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
