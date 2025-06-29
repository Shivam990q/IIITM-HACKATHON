const express = require('express');
const { check } = require('express-validator');
const categoryController = require('../controllers/category.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.get('/', categoryController.getCategories);

// Protected admin routes
router.get(
  '/all',
  authMiddleware.protect,
  authMiddleware.restrictTo('admin'),
  categoryController.getAllCategories
);

router.post(
  '/',
  authMiddleware.protect,
  authMiddleware.restrictTo('admin'),
  [
    check('name', 'Category name is required').not().isEmpty(),
    check('name', 'Category name must be between 2 and 50 characters').isLength({ min: 2, max: 50 }),
  ],
  categoryController.createCategory
);

router.patch(
  '/:id',
  authMiddleware.protect,
  authMiddleware.restrictTo('admin'),
  categoryController.updateCategory
);

router.delete(
  '/:id',
  authMiddleware.protect,
  authMiddleware.restrictTo('admin'),
  categoryController.deleteCategory
);

router.patch(
  '/:id/toggle',
  authMiddleware.protect,
  authMiddleware.restrictTo('admin'),
  categoryController.toggleCategoryStatus
);

router.patch(
  '/reorder',
  authMiddleware.protect,
  authMiddleware.restrictTo('admin'),
  categoryController.reorderCategories
);

module.exports = router;
