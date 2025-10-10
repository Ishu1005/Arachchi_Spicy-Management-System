const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  price: Number,
  category: String, // For example: whole, powder, organic, etc.
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
// This schema defines an Inventory model with fields for name, quantity, price, category, and supplier.
// The 'supplier' field is a reference to the Supplier model, which helps link an inventory item to its supplier.
