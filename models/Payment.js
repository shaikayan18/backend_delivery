const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  transaction_id: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: 'Success' }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);