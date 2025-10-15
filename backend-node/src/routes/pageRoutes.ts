import { Router } from 'express';
import * as pageController from '../controllers/pageController';
import { authenticateToken } from '../middleware/auth';
import { requireSuperuser } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createPageSchema, updatePageSchema } from '../types/validation';

/**
 * Page (CMS) routes
 * Base path: /api/v1/pages
 */
const router = Router();

// GET /api/v1/pages - Get all pages (public)
router.get('/', pageController.getAllPages);

// GET /api/v1/pages/:slug - Get page by slug (public)
router.get('/:slug', pageController.getPageBySlug);

// All routes below require authentication and Superuser role
router.use(authenticateToken, requireSuperuser());

// POST /api/v1/pages - Create page (Superuser only)
router.post('/', validate(createPageSchema), pageController.createPage);

// PUT /api/v1/pages/:id - Update page (Superuser only)
router.put('/:id', validate(updatePageSchema), pageController.updatePage);

// DELETE /api/v1/pages/:id - Soft delete page (Superuser only)
router.delete('/:id', pageController.deletePage);

export default router;
