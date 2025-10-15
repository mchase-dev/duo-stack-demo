import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { requireSuperuser } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createPageSchema, updatePageSchema } from '../types/validation';
import { UserRole } from '../models';
import { successResponse, errorResponse } from '../utils/response';
import {
  getAllPagesHandler,
  getPageBySlugHandler,
  createPageHandler,
  updatePageHandler,
  deletePageHandler,
} from '../domain/pages';

/**
 * Page Controller
 * Handles CMS page management (Superuser only for create/update/delete)
 */

/**
 * GET /pages
 * Get all pages
 * Public users see only published pages
 * Superusers see all pages
 */
export const getAllPages = [
  asyncHandler(async (req: Request, res: Response) => {
    const userRole = req.user?.role as UserRole | undefined;

    const result = await getAllPagesHandler(userRole);
    return successResponse(res, result);
  }),
];

/**
 * GET /pages/:slug
 * Get page by slug
 * Public users can only access published pages
 * Superusers can access any page
 */
export const getPageBySlug = [
  asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;
    const userRole = req.user?.role as UserRole | undefined;

    try {
      const page = await getPageBySlugHandler(slug, userRole);
      return successResponse(res, page);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return errorResponse(res, error.message, 404);
      }
      return errorResponse(res, 'Failed to retrieve page', 500);
    }
  }),
];

/**
 * POST /pages
 * Create new page (Superuser only)
 * Auto-generates slug from title if not provided
 */
export const createPage = [
  authenticateToken,
  requireSuperuser(),
  validate(createPageSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId!;

    const page = await createPageHandler(userId, req.body);
    return successResponse(res, page, 201);
  }),
];

/**
 * PUT /pages/:id
 * Update page (Superuser only)
 * Updates page content, title, slug, or publish status
 */
export const updatePage = [
  authenticateToken,
  requireSuperuser(),
  validate(updatePageSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const updatedPage = await updatePageHandler(id, req.body);
      return successResponse(res, updatedPage);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return errorResponse(res, error.message, 404);
      }
      return errorResponse(res, 'Failed to update page', 500);
    }
  }),
];

/**
 * DELETE /pages/:id
 * Soft delete page (Superuser only)
 * Marks page as deleted without removing from database
 */
export const deletePage = [
  authenticateToken,
  requireSuperuser(),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      await deletePageHandler(id);
      return successResponse(res, { message: 'Page deleted successfully' });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return errorResponse(res, error.message, 404);
      }
      return errorResponse(res, 'Failed to delete page', 500);
    }
  }),
];
