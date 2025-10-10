const express = require('express');
const router = express.Router();
const {
  createSupplier,
  getSuppliers,
  updateSupplier,
  deleteSupplier
} = require('../controllers/supplierController');

const auth = require('../middleware/authMiddleware');

router.post('/', auth, createSupplier);
router.get('/', auth, getSuppliers);
router.put('/:id', auth, updateSupplier);
router.delete('/:id', auth, deleteSupplier);

module.exports = router;

// This code sets up the supplier routes for managing suppliers in an Express application.
// It imports the necessary modules, defines the routes for creating, retrieving, updating, and deleting