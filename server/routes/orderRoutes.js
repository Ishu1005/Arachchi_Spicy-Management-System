const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  createOrder,
  getAllOrders,
  updateOrder,
  deleteOrder
} = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');

// Configure multer for image uploads
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

router.post('/', auth, upload.single('productImage'), createOrder);
router.get('/', auth, getAllOrders);
router.put('/:id', auth, upload.single('productImage'), updateOrder);
router.delete('/:id', auth, deleteOrder);

module.exports = router;
