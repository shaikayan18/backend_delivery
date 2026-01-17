// routes/restaurants.js - Updated with admin menu management
const express = require("express");
const router = express.Router();
const Restaurant = require("../models/Restaurant");
const Menu = require("../models/Menu");
const authMiddleware = require("../middleware/auth");

// Get all restaurants
router.get("/", async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get menu for a restaurant
router.get("/:id/menu", async (req, res) => {
  try {
    const menu = await Menu.find({ restaurant_id: req.params.id });
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Add menu item (Admin only)
router.post("/:id/menu", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { name, price, category, image } = req.body;

    const menuItem = new Menu({
      restaurant_id: req.params.id,
      name,
      price,
      category: category || "Main Course",
      image: image || "https://via.placeholder.com/150",
    });

    await menuItem.save();
    res.status(201).json({ message: "Menu item added", item: menuItem });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete menu item (Admin only)
router.delete("/menu/:menuId", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    await Menu.findByIdAndDelete(req.params.menuId);
    res.json({ message: "Menu item deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;