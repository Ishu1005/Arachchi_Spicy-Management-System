const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: { type: String, enum: ['whole', 'powder', 'organic'], default: 'whole' },
  price: Number,
  quantity: Number,
  quantityType: { type: String, enum: ['kg', 'g'], default: 'kg' },
  image: String
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
// This schema defines the structure of a product document in MongoDB.
// It includes fields for name, description, category, price, quantity, quantityType, and image