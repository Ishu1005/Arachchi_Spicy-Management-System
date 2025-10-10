const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createProduct, getAllProducts, updateProduct, deleteProduct } = require('../controllers/productController');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.post('/', upload.single('image'), createProduct);
router.get('/', getAllProducts);
router.put('/:id', upload.single('image'), updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
// This code sets up the product routes for creating, reading, updating, and deleting products.
// It uses multer for handling file uploads and defines the necessary endpoints for product management.