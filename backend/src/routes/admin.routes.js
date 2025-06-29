const express = require('express');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const adminController = require('../controllers/admin.controller');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(restrictTo('admin'));

// Admin dashboard statistics
router.get('/stats', adminController.getDashboardStats);

// User management
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// Complaint management
router.get('/complaints', adminController.getAllComplaints);
router.get('/complaints/:id', adminController.getComplaintDetails);
router.patch('/complaints/:id/assign', adminController.assignComplaintToOfficial);
router.patch('/complaints/:id/status', adminController.updateComplaintStatus);

module.exports = router;
