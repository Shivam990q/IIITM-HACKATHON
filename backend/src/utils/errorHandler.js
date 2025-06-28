/**
 * Custom error class for API errors
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async error handler to avoid try-catch blocks
 * @param {Function} fn - Async function to handle
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * Error handler for duplicate key errors (MongoDB)
 * @param {Error} err - Error object
 * @returns {Error} AppError
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate field value: ${value}. Please use another value for ${field}.`;
  return new AppError(message, 400);
};

/**
 * Error handler for validation errors (MongoDB)
 * @param {Error} err - Error object
 * @returns {Error} AppError
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Error handler for JWT errors
 * @param {Error} err - Error object
 * @returns {Error} AppError
 */
const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again.', 401);
};

/**
 * Error handler for expired JWT tokens
 * @param {Error} err - Error object
 * @returns {Error} AppError
 */
const handleJWTExpiredError = () => {
  return new AppError('Your token has expired. Please log in again.', 401);
};

/**
 * Global error handler for development environment
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

/**
 * Global error handler for production environment
 */
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

/**
 * Global error handler middleware
 */
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    
    if (err.code === 11000) error = handleDuplicateKeyError(err);
    if (err.name === 'ValidationError') error = handleValidationError(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
    
    sendErrorProd(error, res);
  }
};

module.exports = {
  AppError,
  catchAsync,
  globalErrorHandler,
}; 