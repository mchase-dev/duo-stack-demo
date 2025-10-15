import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin, requireSuperuser } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { updateProfileSchema, updateUserRoleSchema } from '../types/validation';

/**
 * User management routes
 * Base path: /api/v1/users
 */
const router = Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/v1/users - Get all users (Admin+ only)
router.get('/', requireAdmin(), userController.getAllUsers);

// GET /api/v1/users/:id - Get user by ID (self or Admin+)
router.get('/:id', userController.getUserById);

// PUT /api/v1/users/:id - Update user (self or Admin+)
router.put('/:id', validate(updateProfileSchema), userController.updateUser);

// DELETE /api/v1/users/:id - Soft delete user (Admin+ only)
router.delete('/:id', requireAdmin(), userController.deleteUser);

// PUT /api/v1/users/:id/role - Update user role (Superuser only)
router.put('/:id/role', requireSuperuser(), validate(updateUserRoleSchema), userController.updateUserRole);

export default router;
