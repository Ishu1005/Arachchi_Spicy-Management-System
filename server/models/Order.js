const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  items: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      category: { type: String }
    }
  ],
  paymentMethod: { type: String, required: true },
  deliveryMethod: { type: String, required: true },
  address: { type: String, required: true },
  customerName: { type: String },
  customerContact: { type: String },
  orderDate: { type: Date, default: Date.now },
  status: { type: String, default: 'pending', enum: ['pending', 'processing', 'completed', 'cancelled'] },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
