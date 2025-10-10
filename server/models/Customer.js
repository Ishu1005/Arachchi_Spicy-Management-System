const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: String,
  contact: String,
  email: { type: String, required: true },
  address: String,
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
// This schema defines a Customer model with fields for name, contact, email, address, and orders.
// The 'orders' field is an array of ObjectIds that reference the Order model, allowing