import { Router } from 'express';
import * as roomController from '../controllers/roomController';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createRoomSchema, updateRoomSchema } from '../types/validation';

/**
 * Room routes
 * Base path: /api/v1/rooms
 */
const router = Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/v1/rooms - Get all rooms
router.get('/', roomController.getAllRooms);

// POST /api/v1/rooms - Create room (Admin+ only)
router.post('/', requireAdmin(), validate(createRoomSchema), roomController.createRoom);

// PUT /api/v1/rooms/:id - Update room (Admin+ only)
router.put('/:id', requireAdmin(), validate(updateRoomSchema), roomController.updateRoom);

// DELETE /api/v1/rooms/:id - Soft delete room (Admin+ only)
router.delete('/:id', requireAdmin(), roomController.deleteRoom);

export default router;
