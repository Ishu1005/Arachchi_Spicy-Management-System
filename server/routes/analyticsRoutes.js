const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

// All analytics routes require authentication
router.use(authMiddleware);

// Get sales data by spice type (Pie Chart)
router.get('/sales-by-spice-type', analyticsController.getSalesBySpiceType);

// Get customer order frequency (Bar Chart)
router.get('/customer-order-frequency', analyticsController.getCustomerOrderFrequency);

// Get monthly order trend (Line Chart)
router.get('/monthly-order-trend', analyticsController.getMonthlyOrderTrend);

// Get order status distribution (Doughnut Chart)
router.get('/order-status-distribution', analyticsController.getOrderStatusDistribution);

module.exports = router;
