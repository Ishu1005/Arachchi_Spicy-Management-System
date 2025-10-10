const express = require('express');
const router = express.Router();
const { getAllInventoryItems, createInventoryItem, updateInventoryItem, deleteInventoryItem } = require('../controllers/inventoryController');


router.get('/', getAllInventoryItems);
router.post('/', createInventoryItem);
router.put('/:id', updateInventoryItem);
router.delete('/:id', deleteInventoryItem);

module.exports = router;
