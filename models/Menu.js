// models/Menu.js - COMPLETE VERSION
const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema(
  {
    restaurant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, default: "https://via.placeholder.com/150" },
    category: { type: String, default: "Main Course" },
    description: { type: String },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Menu", menuSchema);
