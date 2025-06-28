const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

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
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email already in use',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email: normalizedEmail,
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
        message: 'Invalid input data.',
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Find user and include password for verification
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    // Check if user exists and password is correct
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password',
      });
    }

    // Don't allow admins to log in through the general login route
    if (user.role === 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Admin login prohibited through this route. Please use /api/auth/admin/login.',
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = generateToken(user._id);

    // Remove password from user object before sending
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user,
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

// Add admin login endpoint
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password'
      });
    }
    
    // Find user with admin role
    const admin = await User.findOne({ email, role: 'admin' }).select('+password');
    
    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid credentials for administrator'
      });
    }
    
    // Update last login
    admin.lastLogin = Date.now();
    await admin.save({ validateBeforeSave: false });
    
    // Generate JWT token using the helper function
    const token = generateToken(admin._id);
    
    // Remove password from admin object before sending
    admin.password = undefined;
    
    return res.status(200).json({
      status: 'success',
      token,
      data: {
        user: admin,
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error during admin login'
    });
  }
};

// Add function to create admin account (for initial setup)
exports.createAdmin = async (req, res) => {
  try {
    // This endpoint should be secured or disabled in production
    // Check if admin already exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      return res.status(400).json({
        status: 'error',
        message: 'Admin account already exists'
      });
    }
    
    // Create admin account
    const admin = new User({
      name: 'System Administrator',
      email: 'admin@nyaychain.com',
      password: await bcrypt.hash('admin123', 10), // Use a secure password in production
      role: 'admin'
    });
    
    await admin.save();
    
    return res.status(201).json({
      status: 'success',
      message: 'Admin account created successfully',
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error during admin creation'
    });
  }
};

/**
 * Logout user
 * @route POST /api/auth/logout
 * @access Public
 */
exports.logout = (req, res) => {
  // On the client-side, the token should be removed.
  // This endpoint is for acknowledging the logout action.
  res.status(200).json({ 
    status: 'success', 
    message: 'User logged out successfully' 
  });
}; 