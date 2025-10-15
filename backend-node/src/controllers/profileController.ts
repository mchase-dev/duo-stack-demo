import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateProfileSchema, changePasswordSchema } from '../types/validation';
import { successResponse, errorResponse } from '../utils/response';
import {
  getMyProfileHandler,
  updateMyProfileHandler,
  uploadAvatarHandler,
  changePasswordHandler,
} from '../domain/profile';

/**
 * Profile Controller
 * Handles current user profile operations including avatar upload
 */

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'avatar-' + req.user?.userId + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (_req, file, cb) => {
    // Accept images only
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'));
    }
  },
});

/**
 * GET /profile/me
 * Get current user profile
 * Returns authenticated user's profile data
 */
export const getMyProfile = [
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId!;

    try {
      const user = await getMyProfileHandler(userId);
      return successResponse(res, user);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return errorResponse(res, error.message, 404);
      }
      return errorResponse(res, 'Failed to retrieve profile', 500);
    }
  }),
];

/**
 * PUT /profile/me
 * Update current user profile
 * Updates authenticated user's profile information
 */
export const updateMyProfile = [
  authenticateToken,
  validate(updateProfileSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId!;

    try {
      const updatedUser = await updateMyProfileHandler(userId, req.body);
      return successResponse(res, updatedUser);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return errorResponse(res, error.message, 404);
        }
        if (error.message.includes('Username already taken')) {
          return errorResponse(res, error.message, 409);
        }
      }
      return errorResponse(res, 'Failed to update profile', 500);
    }
  }),
];

/**
 * POST /profile/me/avatar
 * Upload avatar for current user
 * Accepts image file, saves to UPLOAD_DIR, returns avatarUrl
 */
export const uploadAvatar = [
  authenticateToken,
  upload.single('avatar'),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId!;

    if (!req.file) {
      return errorResponse(res, 'No file uploaded', 400);
    }

    try {
      const result = await uploadAvatarHandler(userId, req.file);
      return successResponse(res, result);
    } catch (error) {
      // Clean up uploaded file on error
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.error('Failed to clean up uploaded file:', cleanupError);
        }
      }

      if (error instanceof Error && error.message.includes('not found')) {
        return errorResponse(res, error.message, 404);
      }
      return errorResponse(res, 'Failed to upload avatar', 500);
    }
  }),
];

/**
 * POST /profile/me/password
 * Change password for current user
 * Verifies current password and updates to new password
 */
export const changePassword = [
  authenticateToken,
  validate(changePasswordSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId!;

    try {
      await changePasswordHandler(userId, req.body);
      return successResponse(res, { message: 'Password changed successfully' });
    } catch (error: any) {
      if (error.status === 401) {
        return errorResponse(res, error.message, 401);
      }
      if (error.status === 400) {
        return errorResponse(res, error.message, 400);
      }
      if (error instanceof Error && error.message.includes('not found')) {
        return errorResponse(res, error.message, 404);
      }
      return errorResponse(res, 'Failed to change password', 500);
    }
  }),
];
