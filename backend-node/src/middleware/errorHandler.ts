import { Request, Response, NextFunction } from 'express';
import { UniqueConstraintError, ValidationError, ForeignKeyConstraintError } from 'sequelize';

/**
 * Centralized Error Handler Middleware
 * Catches and handles all errors in the application
 */

/**
 * Error handler middleware
 * Must be placed after all routes in Express app
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('\n========================================');
    console.error('ERROR:', err.name);
    console.error('MESSAGE:', err.message);
    console.error('STACK:', err.stack);
    console.error('========================================\n');
  } else {
    // Log minimal info in production
    console.error(`[${new Date().toISOString()}] Error:`, err.message);
  }

  // Handle Sequelize errors
  if (err instanceof UniqueConstraintError) {
    // Extract field name from error
    const field = err.errors?.[0]?.path || 'field';
    res.status(409).json({
      error: 'Duplicate entry',
      message: `A record with this ${field} already exists`,
      field,
    });
    return;
  }

  if (err instanceof ValidationError) {
    // Format Sequelize validation errors
    const errors = err.errors.map((error) => ({
      field: error.path,
      message: error.message,
      value: error.value,
    }));

    res.status(400).json({
      error: 'Validation error',
      details: errors,
    });
    return;
  }

  if (err instanceof ForeignKeyConstraintError) {
    res.status(400).json({
      error: 'Invalid reference',
      message: 'The referenced record does not exist',
    });
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      error: 'Authentication failed',
      message: 'Invalid token',
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      error: 'Authentication failed',
      message: 'Token expired',
    });
    return;
  }

  // Handle custom application errors
  if ('statusCode' in err && typeof (err as any).statusCode === 'number') {
    res.status((err as any).statusCode).json({
      error: err.name || 'Application error',
      message: err.message,
    });
    return;
  }

  // Handle unknown errors
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development'
      ? err.message
      : 'An unexpected error occurred',
  });
}

/**
 * Not Found handler
 * Handles requests to undefined routes
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.url} not found`,
  });
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors and pass to error handler
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
