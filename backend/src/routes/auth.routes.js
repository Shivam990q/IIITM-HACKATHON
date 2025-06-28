const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Register a new user
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  ],
  authController.register
);

// Login user
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  authController.login
);

// Admin login
router.post(
  '/admin/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  authController.adminLogin
);

// Create admin account (should be secured or disabled in production)
router.post(
  '/admin/create',
  authMiddleware.protect,
  authMiddleware.restrictTo('admin'),
  authController.createAdmin
);

// Get current user
router.get('/me', authMiddleware.protect, authController.getMe);

// Logout user
router.post('/logout', authController.logout);

module.exports = router; 