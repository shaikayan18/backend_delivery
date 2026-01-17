const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    menu_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' },
    name: String,
    price: Number,
    quantity: Number
  }],
  total: { type: Number, required: true },
  status: { type: String, enum: ['Placed', 'Preparing', 'Delivered'], default: 'Placed' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);