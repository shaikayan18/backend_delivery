const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, default: 'https://via.placeholder.com/150' },
  rating: { type: Number, default: 4.0 }
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);