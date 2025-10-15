import { Router } from 'express';
import * as authController from '../controllers/authController';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema } from '../types/validation';

/**
 * Authentication routes
 * Base path: /api/v1/auth
 */
const router = Router();

// POST /api/v1/auth/register - Register new user
router.post('/register', validate(registerSchema), authController.register);

// POST /api/v1/auth/login - Login user
router.post('/login', validate(loginSchema), authController.login);

// POST /api/v1/auth/refresh - Refresh access token
router.post('/refresh', authController.refresh);

// POST /api/v1/auth/logout - Logout user
router.post('/logout', authController.logout);

// GET /api/v1/auth/confirm-email - Confirm email address
router.get('/confirm-email', authController.confirmEmail);

export default router;
