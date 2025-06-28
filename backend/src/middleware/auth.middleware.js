const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * Middleware to protect routes - verifies the JWT token
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in. Please log in to get access',
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if user still exists
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          status: 'fail',
          message: 'The user belonging to this token no longer exists',
        });
      }

      // Grant access to protected route
      req.user = user;
      next();
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          status: 'fail',
          message: 'Your token has expired. Please log in again.',
        });
      } else if (jwtError instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          status: 'fail',
          message: 'Invalid token. Please log in again.',
        });
      } else {
        throw jwtError; // Rethrow if it's another type of error
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred while authenticating',
    });
  }
};

/**
 * Middleware to restrict access to specific roles
 * @param {Array} roles - Array of allowed roles
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action',
      });
    }
    next();
  };
}; 