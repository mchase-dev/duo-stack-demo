import { Response } from 'express';

/**
 * Standard success response format
 */
export function successResponse<T>(res: Response, data: T, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}

/**
 * Standard error response format
 */
export function errorResponse(res: Response, error: string, statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    error,
  });
}
