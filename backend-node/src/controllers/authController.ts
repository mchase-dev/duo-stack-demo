import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema } from '../types/validation';
import { registerHandler, loginHandler, refreshTokenHandler, logoutHandler } from '../domain/auth';
import { successResponse, errorResponse } from '../utils/response';
import { User } from '../models';

/**
 * Authentication Controller
 * Handles user registration, login, token refresh, logout, and email confirmation
 */

/**
 * POST /auth/register
 * Register a new user account
 * Creates user, sets refresh token cookie, returns user + accessToken
 */
export const register = [
  validate(registerSchema),
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const result = await registerHandler(req.body);

      // Set httpOnly, secure cookie for refresh token
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return successResponse(
        res,
        {
          user: result.user,
          accessToken: result.accessToken,
        },
        201
      );
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('already exists') || error.message.includes('already taken')) {
          return errorResponse(res, error.message, 409);
        }
      }
      return errorResponse(res, 'Registration failed', 500);
    }
  }),
];

/**
 * POST /auth/login
 * Login user with email and password
 * Sets refresh token cookie, returns accessToken
 */
export const login = [
  validate(loginSchema),
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const result = await loginHandler(email, password);

      // Set httpOnly, secure cookie for refresh token
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return successResponse(res, {
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Invalid email or password')) {
          return errorResponse(res, 'Invalid email or password', 401);
        }
      }
      return errorResponse(res, 'Login failed', 500);
    }
  }),
];

/**
 * POST /auth/refresh
 * Refresh access token using refresh token from cookie
 * Returns new accessToken
 */
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return errorResponse(res, 'Refresh token not found', 401);
  }

  try {
    const result = await refreshTokenHandler(refreshToken);
    return successResponse(res, { accessToken: result.accessToken });
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(res, error.message, 401);
    }
    return errorResponse(res, 'Invalid or expired refresh token', 401);
  }
});

/**
 * POST /auth/logout
 * Logout user by revoking refresh token from cookie
 * Clears refresh token cookie
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return errorResponse(res, 'No active session found', 400);
  }

  try {
    await logoutHandler(refreshToken);

    // Clear the refresh token cookie
    res.clearCookie('refreshToken');

    return successResponse(res, { message: 'Logout successful' });
  } catch (error) {
    // Even if token revocation fails, clear the cookie
    res.clearCookie('refreshToken');

    if (error instanceof Error) {
      return errorResponse(res, error.message, 400);
    }
    return errorResponse(res, 'Logout failed', 400);
  }
});

/**
 * GET /auth/confirm-email?token=...
 * Confirm user email address using verification token
 * Updates user.emailConfirmed to true
 */
export const confirmEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.query;

  if (!token || typeof token !== 'string') {
    return errorResponse(res, 'Email confirmation token is required', 400);
  }

  try {
    // In a real implementation, you would:
    // 1. Verify the token signature/expiration
    // 2. Extract the user ID from the token
    // 3. Update the user's emailConfirmed status

    // For now, we'll assume the token contains the user ID
    // This is a simplified implementation - in production you'd use JWT or a secure token system
    const user = await User.findOne({ where: { id: token } });

    if (!user) {
      return errorResponse(res, 'Invalid or expired confirmation token', 400);
    }

    if (user.emailConfirmed) {
      return successResponse(res, { message: 'Email already confirmed' });
    }

    // Update user's email confirmation status
    await user.update({ emailConfirmed: true });

    return successResponse(res, { message: 'Email confirmed successfully' });
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(res, error.message, 400);
    }
    return errorResponse(res, 'Email confirmation failed', 400);
  }
});
