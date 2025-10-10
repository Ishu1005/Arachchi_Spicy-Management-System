const express = require('express');
const router = express.Router();

const Product = require('../models/Product');
const Order = require('../models/Order');
const Supplier = require('../models/Supplier');
const Customer = require('../models/Customer');

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [totalProducts, activeOrders, totalSuppliers, totalCustomers] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      Supplier.countDocuments(),
      Customer.countDocuments()
    ]);

    res.json({
      totalProducts,
      activeOrders,
      suppliers: totalSuppliers,
      customers: totalCustomers
    });
  } catch (err) {
    console.error('Failed to fetch stats:', err);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

module.exports = router;
