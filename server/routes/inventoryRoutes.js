const express = require('express');
const router = express.Router();
const { 
  getAllInventoryItems, 
  createInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem,
  getAllNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getNotificationCount
} = require('../controllers/inventoryController');

// Inventory routes
router.get('/', getAllInventoryItems);
router.post('/', createInventoryItem);
router.put('/:id', updateInventoryItem);
router.delete('/:id', deleteInventoryItem);

// Notification routes
router.get('/notifications', getAllNotifications);
router.get('/notifications/unread', getUnreadNotifications);
router.get('/notifications/count', getNotificationCount);
router.put('/notifications/:id/read', markNotificationAsRead);
router.put('/notifications/read-all', markAllNotificationsAsRead);

module.exports = router;
