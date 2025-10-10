const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema({
  item: String,
  unitPrice: Number,
}, { _id: false });

const supplierSchema = new mongoose.Schema({
  name: String,
  companyName: String,
  contact: String,
  email: String,
  address: String,
  supplyCategories: [String],
  pricingAgreement: [pricingSchema],
  isActive: { type: Boolean, default: true },
  contractStart: Date,
  contractEnd: Date,
  gstNumber: String,
  deliverySchedule: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
