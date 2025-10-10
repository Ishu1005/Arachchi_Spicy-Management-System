const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  deliveryAddress: { type: String, required: true },
  deliveryCity: { type: String, required: true },
  deliveryState: { type: String, required: true },
  deliveryZipCode: { type: String, required: true },
  deliveryDate: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'in_transit', 'delivered', 'failed'], default: 'pending' },
  trackingNumber: { type: String, unique: true },
  deliveryNotes: { type: String },
  deliveryPerson: { type: String },
  estimatedDeliveryTime: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Delivery', deliverySchema);
// This schema defines the structure of a delivery document in MongoDB.
// It includes fields for order reference, customer details, delivery information, and status tracking.
