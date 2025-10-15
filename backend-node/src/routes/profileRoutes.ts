import { Router } from 'express';
import * as profileController from '../controllers/profileController';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateProfileSchema, changePasswordSchema } from '../types/validation';

/**
 * Profile routes
 * Base path: /api/v1/profile
 */
const router = Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/v1/profile/me - Get current user profile
router.get('/me', profileController.getMyProfile);

// PUT /api/v1/profile/me - Update current user profile
router.put('/me', validate(updateProfileSchema), profileController.updateMyProfile);

// POST /api/v1/profile/me/avatar - Upload avatar
router.post('/me/avatar', profileController.uploadAvatar);

// POST /api/v1/profile/me/password - Change password
router.post('/me/password', validate(changePasswordSchema), profileController.changePassword);

export default router;
