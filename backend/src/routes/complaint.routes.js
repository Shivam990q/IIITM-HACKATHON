const express = require('express');
const { check } = require('express-validator');
const complaintController = require('../controllers/complaint.controller');
const authMiddleware = require('../middleware/auth.middleware');
const uploadMiddleware = require('../middleware/upload.middleware');

const router = express.Router();

// Public routes
router.get('/', complaintController.getComplaints);
router.get('/:id', complaintController.getComplaint);

// Protected routes
router.post(
  '/',
  authMiddleware.protect,
  uploadMiddleware.upload.array('images', 5),
  uploadMiddleware.handleMulterError,
  [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('category', 'Category is required').not().isEmpty(),
    check('location.lat', 'Latitude is required').not().isEmpty(),
    check('location.lng', 'Longitude is required').not().isEmpty(),
    check('address', 'Address is required').not().isEmpty(),
  ],
  complaintController.createComplaint
);

router.patch(
  '/:id/status',
  authMiddleware.protect,
  authMiddleware.restrictTo('admin', 'official'),
  [
    check('status', 'Status is required').isIn([
      'pending', 
      'acknowledged', 
      'in_progress', 
      'resolved', 
      'rejected'
    ]),
  ],
  complaintController.updateComplaintStatus
);

router.post(
  '/:id/comments',
  authMiddleware.protect,
  [check('text', 'Comment text is required').not().isEmpty()],
  complaintController.addComment
);

router.patch(
  '/:id/assign',
  authMiddleware.protect,
  authMiddleware.restrictTo('admin'),
  [
    check('officialId', 'Official ID is required').not().isEmpty(),
    check('department', 'Department is required').not().isEmpty(),
  ],
  complaintController.assignComplaint
);

router.post('/:id/upvote', authMiddleware.protect, complaintController.upvoteComplaint);

module.exports = router; 