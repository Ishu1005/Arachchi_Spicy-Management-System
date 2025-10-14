const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createProduct, getAllProducts, updateProduct, deleteProduct } = require('../controllers/productController');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// File filter to only allow JPG and PNG images
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Only JPG and PNG images are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

router.post('/', upload.single('image'), createProduct);
router.get('/', getAllProducts);
router.put('/:id', upload.single('image'), updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
// This code sets up the product routes for creating, reading, updating, and deleting products.
// It uses multer for handling file uploads and defines the necessary endpoints for product management.