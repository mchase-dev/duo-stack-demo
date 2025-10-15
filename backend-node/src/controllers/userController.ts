import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin, requireSuperuser } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { updateProfileSchema, updateUserRoleSchema } from '../types/validation';
import { UserRole } from '../models';
import { successResponse, errorResponse } from '../utils/response';
import {
  getAllUsersHandler,
  getUserByIdHandler,
  updateUserHandler,
  deleteUserHandler,
  updateUserRoleHandler,
} from '../domain/users';

/**
 * User Management Controller
 * Handles user CRUD operations with role-based access control
 */

/**
 * GET /users
 * Get all users with pagination and search (Admin+ only)
 * Query params: page (default: 1), pageSize (default: 50), search (optional)
 */
export const getAllUsers = [
  authenticateToken,
  requireAdmin(),
  asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 50;
    const search = req.query.search as string | undefined;

    const result = await getAllUsersHandler({ page, pageSize, search });
    return successResponse(res, result);
  }),
];

/**
 * GET /users/:id
 * Get user by ID (self or Admin+)
 * Users can view their own profile, admins can view any profile
 */
export const getUserById = [
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const requestingUserId = req.user?.userId!;
    const requestingUserRole = req.user?.role as UserRole;

    try {
      const user = await getUserByIdHandler(id, requestingUserId, requestingUserRole);
      return successResponse(res, user);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return errorResponse(res, error.message, 404);
        }
        if (error.message.includes('Insufficient permissions')) {
          return errorResponse(res, error.message, 403);
        }
      }
      return errorResponse(res, 'Failed to retrieve user', 500);
    }
  }),
];

/**
 * PUT /users/:id
 * Update user profile (self or Admin+)
 * Users can update their own profile, admins can update any profile
 */
export const updateUser = [
  authenticateToken,
  validate(updateProfileSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const requestingUserId = req.user?.userId!;
    const requestingUserRole = req.user?.role as UserRole;

    try {
      const updatedUser = await updateUserHandler(id, requestingUserId, requestingUserRole, req.body);
      return successResponse(res, updatedUser);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return errorResponse(res, error.message, 404);
        }
        if (error.message.includes('Insufficient permissions')) {
          return errorResponse(res, error.message, 403);
        }
      }
      return errorResponse(res, 'Failed to update user', 500);
    }
  }),
];

/**
 * DELETE /users/:id
 * Soft delete user (Admin+ only)
 * Marks user as deleted without removing from database
 */
export const deleteUser = [
  authenticateToken,
  requireAdmin(),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      await deleteUserHandler(id);
      return successResponse(res, { message: 'User deleted successfully' });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return errorResponse(res, error.message, 404);
      }
      return errorResponse(res, 'Failed to delete user', 500);
    }
  }),
];

/**
 * PUT /users/:id/role
 * Update user role (Superuser only)
 * Changes user's role in the system
 */
export const updateUserRole = [
  authenticateToken,
  requireSuperuser(),
  validate(updateUserRoleSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;

    try {
      const updatedUser = await updateUserRoleHandler(id, role);
      return successResponse(res, updatedUser);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return errorResponse(res, error.message, 404);
      }
      return errorResponse(res, 'Failed to update user role', 500);
    }
  }),
];
