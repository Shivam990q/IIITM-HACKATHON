const { validationResult } = require('express-validator');
const Category = require('../models/category.model');

/**
 * Get all active categories
 * @route GET /api/categories
 * @access Public
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.getActiveCategories();
    
    res.status(200).json({
      status: 'success',
      results: categories.length,
      data: {
        categories,
      },
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching categories',
    });
  }
};

/**
 * Get all categories (including inactive) - Admin only
 * @route GET /api/categories/all
 * @access Private (Admin)
 */
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1, name: 1 });
    
    res.status(200).json({
      status: 'success',
      results: categories.length,
      data: {
        categories,
      },
    });
  } catch (error) {
    console.error('Get all categories error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching categories',
    });
  }
};

/**
 * Create a new category
 * @route POST /api/categories
 * @access Private (Admin)
 */
exports.createCategory = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        errors: errors.array(),
      });
    }

    const { name, description, icon, color, order } = req.body;

    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        status: 'fail',
        message: 'Category with this name already exists',
      });
    }

    const category = await Category.create({
      name,
      description,
      icon: icon || 'FileText',
      color: color || '#3b82f6',
      order: order || 0,
      createdBy: req.user._id,
    });

    res.status(201).json({
      status: 'success',
      data: {
        category,
      },
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while creating category',
    });
  }
};

/**
 * Update a category
 * @route PATCH /api/categories/:id
 * @access Private (Admin)
 */
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const category = await Category.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        status: 'fail',
        message: 'Category not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        category,
      },
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating category',
    });
  }
};

/**
 * Delete a category
 * @route DELETE /api/categories/:id
 * @access Private (Admin)
 */
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category is being used in any complaints
    const Complaint = require('../models/complaint.model');
    const complaintCount = await Complaint.countDocuments({ category: id });

    if (complaintCount > 0) {
      return res.status(400).json({
        status: 'fail',
        message: `Cannot delete category. It is being used in ${complaintCount} complaint(s).`,
      });
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({
        status: 'fail',
        message: 'Category not found',
      });
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting category',
    });
  }
};

/**
 * Toggle category status (active/inactive)
 * @route PATCH /api/categories/:id/toggle
 * @access Private (Admin)
 */
exports.toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        status: 'fail',
        message: 'Category not found',
      });
    }

    category.isActive = !category.isActive;
    await category.save();

    res.status(200).json({
      status: 'success',
      data: {
        category,
      },
    });
  } catch (error) {
    console.error('Toggle category status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while toggling category status',
    });
  }
};

/**
 * Reorder categories
 * @route PATCH /api/categories/reorder
 * @access Private (Admin)
 */
exports.reorderCategories = async (req, res) => {
  try {
    const { categories } = req.body; // Array of {id, order}

    const updatePromises = categories.map(({ id, order }) =>
      Category.findByIdAndUpdate(id, { order }, { new: true })
    );

    await Promise.all(updatePromises);

    const updatedCategories = await Category.getActiveCategories();

    res.status(200).json({
      status: 'success',
      data: {
        categories: updatedCategories,
      },
    });
  } catch (error) {
    console.error('Reorder categories error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while reordering categories',
    });
  }
};
