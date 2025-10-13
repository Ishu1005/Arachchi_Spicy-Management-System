const express = require('express');
const router = express.Router();
const { 
  createDelivery, 
  getAllDeliveries, 
  getDeliveryById, 
  updateDelivery, 
  deleteDelivery,
  updateDeliveryStatus,
  getDeliveryByTrackingNumber
} = require('../controllers/deliveryController');

// All routes
router.post('/', createDelivery);
router.get('/', getAllDeliveries);
router.get('/:id', getDeliveryById);
router.put('/:id', updateDelivery);
router.delete('/:id', deleteDelivery);
router.put('/:id/status', updateDeliveryStatus);
router.get('/track/:trackingNumber', getDeliveryByTrackingNumber);

module.exports = router;
// This code sets up the delivery routes for creating, reading, updating, and deleting deliveries.
// It includes status updates and tracking number lookup functionality.
