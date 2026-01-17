// server.js - COMPLETE WORKING VERSION
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const restaurantRoutes = require("./routes/restaurants");
const analyticsRoutes = require("./routes/analytics");
const orderRoutes = require("./routes/orders");
const Menu = require("./models/Menu");
const Restaurant = require("./models/Restaurant");
const authMiddleware = require("./middleware/auth");

const app = express();

// Connect to MongoDB
connectDB();

// CORS - MUST BE FIRST
app.use(cors());
app.use(express.json());

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files
app.use('/uploads', express.static(uploadsDir));

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    console.log('File filter check:');
    console.log('- Original name:', file.originalname);
    console.log('- MIME type:', file.mimetype);
    
    const allowedTypes = /jpeg|jpg|png|gif|webp/i;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype.startsWith('image/');
    
    console.log('- Extension valid:', extname);
    console.log('- MIME valid:', mimetype);
    
    if (extname || mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// ==================== IMAGE UPLOAD ====================
app.post('/api/upload', authMiddleware, upload.single('image'), (req, res) => {
  try {
    console.log('Upload request received');
    console.log('File:', req.file);
    
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    
    const baseUrl = process.env.NGROK_URL || `http://192.168.31.100:5001`;
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    
    console.log('Image uploaded:', imageUrl);
    res.json({ imageUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Image upload failed', error: error.message });
  }
});

// ==================== MENU ROUTES ====================
app.post('/api/menu', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { restaurant_id, name, price, image, category, description, available } = req.body;

    const newMenuItem = new Menu({
      restaurant_id,
      name,
      price,
      image,
      category,
      description,
      available: available !== undefined ? available : true
    });

    await newMenuItem.save();
    res.status(201).json(newMenuItem);
  } catch (error) {
    console.error('Add menu error:', error);
    res.status(500).json({ message: 'Failed to add menu item', error: error.message });
  }
});

app.put('/api/menu/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;
    const { name, price, image, category, description, available } = req.body;
    const updatedMenuItem = await Menu.findByIdAndUpdate(
      id,
      { name, price, image, category, description, available },
      { new: true }
    );

    if (!updatedMenuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json(updatedMenuItem);
  } catch (error) {
    console.error('Update menu error:', error);
    res.status(500).json({ message: 'Failed to update menu item', error: error.message });
  }
});

app.put('/api/restaurants/:id/image', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;
    const { image } = req.body;

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      id,
      { image },
      { new: true }
    );

    if (!updatedRestaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.json(updatedRestaurant);
  } catch (error) {
    console.error('Update restaurant image error:', error);
    res.status(500).json({ message: 'Failed to update restaurant image', error: error.message });
  }
});

app.delete("/menu/:menuId", authMiddleware, async (req, res) => {
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

// ==================== OTHER ROUTES ====================
app.use("/auth", authRoutes);
app.use("/restaurants", restaurantRoutes);
app.use("/orders", orderRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Food Delivery API Running" });
});

// Error handling
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size too large. Max 5MB allowed.' });
    }
    return res.status(400).json({ message: error.message });
  }
  
  if (error) {
    return res.status(500).json({ message: error.message });
  }
  
  next();
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Local: http://192.168.31.100:${PORT}`);
  console.log(`📁 Uploads: ${uploadsDir}`);
});
