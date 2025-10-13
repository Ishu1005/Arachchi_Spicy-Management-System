const express = require('express');
const router = express.Router();
const { 
  createDelivery, 
  getAllDeliveries, 
  getDeliveryById, 
  updateDelivery, 
  deleteDelivery,
  updateDeliveryStatus,
  getDeliveryByTrackingNumber,
  getDeliveryAnalytics,
  predictDeliveryTime
} = require('../controllers/deliveryController');

// Basic CRUD operations
router.post('/', createDelivery);                    // Create new delivery
router.get('/', getAllDeliveries);                   // Get all deliveries with filters
router.get('/:id', getDeliveryById);                // Get delivery by ID
router.put('/:id', updateDelivery);                 // Update delivery details
router.delete('/:id', deleteDelivery);               // Delete delivery

// Status management
router.put('/:id/status', updateDeliveryStatus);    // Update delivery status only

// Tracking and search
router.get('/track/:trackingNumber', getDeliveryByTrackingNumber); // Get delivery by tracking number

// Smart Delivery Features
router.get('/analytics/overview', getDeliveryAnalytics);          // Get delivery analytics
router.post('/predict-time', predictDeliveryTime);                // Predict delivery time

module.exports = router;
// This code sets up the delivery routes for creating, reading, updating, and deleting deliveries.
// It includes status updates, tracking number lookup, analytics, and AI prediction functionality.
