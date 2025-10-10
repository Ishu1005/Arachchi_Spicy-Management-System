const express = require('express');
const router = express.Router();
const { 
  createFeedback, 
  getAllFeedback, 
  getFeedbackById, 
  updateFeedback, 
  deleteFeedback,
  getPublicFeedback,
  approveFeedback,
  rejectFeedback
} = require('../controllers/feedbackController');

// Public routes
router.get('/public', getPublicFeedback);
router.post('/', createFeedback);

// Admin routes
router.get('/', getAllFeedback);
router.get('/:id', getFeedbackById);
router.put('/:id', updateFeedback);
router.delete('/:id', deleteFeedback);
router.put('/:id/approve', approveFeedback);
router.put('/:id/reject', rejectFeedback);

module.exports = router;
// This code sets up the feedback routes for creating, reading, updating, and deleting feedback.
// It includes public routes for viewing approved feedback and admin routes for management.
