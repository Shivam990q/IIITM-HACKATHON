const User = require('../models/user.model');
const { validationResult } = require('express-validator');

/**
 * Update user profile
 * @route PATCH /api/users/profile
 * @access Private
 */
exports.updateProfile = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        errors: errors.array(),
      });
    }

    const userId = req.user._id;
    const { name, phone, address, bio } = req.body;

    // Find user and update
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (bio) user.bio = bio;

    // Process profile image if uploaded
    if (req.file) {
      user.profileImage = `/uploads/${req.file.filename}`;
    }

    user.updatedAt = Date.now();
    await user.save();

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          bio: user.bio,
          profileImage: user.profileImage,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating profile',
    });
  }
};

/**
 * Get user's complaints
 * @route GET /api/users/complaints
 * @access Private
 */
exports.getUserComplaints = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status, sort = '-createdAt' } = req.query;

    const queryObj = { submittedBy: userId };
    if (status) queryObj.status = status;

    // Count total documents
    const total = await require('../models/complaint.model').countDocuments(queryObj);

    // Execute query
    const complaints = await require('../models/complaint.model')
      .find(queryObj)
      .sort(sort)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('assignedTo', 'name role');

    res.status(200).json({
      status: 'success',
      results: complaints.length,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
      data: {
        complaints,
      },
    });
  } catch (error) {
    console.error('Get user complaints error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching complaints',
    });
  }
};

/**
 * Change password
 * @route PATCH /api/users/password
 * @access Private
 */
exports.changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        errors: errors.array(),
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Find user and include password
    const user = await User.findById(userId).select('+password');

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        status: 'fail',
        message: 'Current password is incorrect',
      });
    }

    // Update password
    user.password = newPassword;
    user.updatedAt = Date.now();
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating password',
    });
  }
};

/**
 * Get officials (for admin to assign complaints)
 * @route GET /api/users/officials
 * @access Private (Admin)
 */
exports.getOfficials = async (req, res) => {
  try {
    const officials = await User.find({ role: 'official' }).select('name email');

    res.status(200).json({
      status: 'success',
      results: officials.length,
      data: {
        officials,
      },
    });
  } catch (error) {
    console.error('Get officials error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching officials',
    });
  }
};

/**
 * Create an official account (admin only)
 * @route POST /api/users/officials
 * @access Private (Admin)
 */
exports.createOfficial = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        errors: errors.array(),
      });
    }

    const { name, email, password, department } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email already in use',
      });
    }

    // Create official
    const official = await User.create({
      name,
      email,
      password,
      role: 'official',
      department,
    });

    res.status(201).json({
      status: 'success',
      data: {
        official: {
          id: official._id,
          name: official.name,
          email: official.email,
          role: official.role,
          department,
        },
      },
    });
  } catch (error) {
    console.error('Create official error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while creating official account',
    });
  }
}; 