const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/user.model');

/**
 * Generate JWT Token
 * @param {ObjectId} id - User ID
 * @returns {string} - JWT Token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
exports.register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'fail',
        errors: errors.array() 
      });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email already in use',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: 'citizen', // Default role
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during registration',
    });
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
exports.login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 'fail',
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user and include password for verification
    const user = await User.findOne({ email }).select('+password');

    // Check if user exists and password is correct
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password',
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during login',
    });
  }
};

/**
 * Get current logged in user
 * @route GET /api/auth/me
 * @access Private
 */
exports.getMe = async (req, res) => {
  try {
    // User is already available from auth middleware
    const user = await User.findById(req.user._id);

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
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching user details',
    });
  }
}; 