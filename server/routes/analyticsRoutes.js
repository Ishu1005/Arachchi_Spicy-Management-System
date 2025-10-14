const express = require('express');
const router = express.Router();
const {
  getSalesBySpiceType,
  getCustomerOrderFrequency,
  getMonthlyOrderTrend,
  getOrderStatusDistribution
} = require('../controllers/analyticsController');

// Analytics routes
router.get('/sales-by-spice-type', getSalesBySpiceType);
router.get('/customer-order-frequency', getCustomerOrderFrequency);
router.get('/monthly-order-trend', getMonthlyOrderTrend);
router.get('/order-status-distribution', getOrderStatusDistribution);

module.exports = router;
