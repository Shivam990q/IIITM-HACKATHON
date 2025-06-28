const express = require('express');
const { check } = require('express-validator');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const uploadMiddleware = require('../middleware/upload.middleware');

const router = express.Router();

// Protected routes
router.patch(
  '/profile',
  authMiddleware.protect,
  uploadMiddleware.upload.single('profileImage'),
  uploadMiddleware.handleMulterError,
  userController.updateProfile
);

router.get('/complaints', authMiddleware.protect, userController.getUserComplaints);

router.patch(
  '/password',
  authMiddleware.protect,
  [
    check('currentPassword', 'Current password is required').not().isEmpty(),
    check('newPassword', 'New password must be at least 6 characters').isLength({
      min: 6,
    }),
  ],
  userController.changePassword
);

// Admin-only routes
router.get(
  '/officials',
  authMiddleware.protect,
  authMiddleware.restrictTo('admin'),
  userController.getOfficials
);

router.post(
  '/officials',
  authMiddleware.protect,
  authMiddleware.restrictTo('admin'),
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({
      min: 6,
    }),
    check('department', 'Department is required').not().isEmpty(),
  ],
  userController.createOfficial
);

module.exports = router; 