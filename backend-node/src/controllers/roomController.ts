import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import { createRoomSchema, updateRoomSchema } from '../types/validation';
import { successResponse, errorResponse } from '../utils/response';
import {
  getAllRoomsHandler,
  createRoomHandler,
  updateRoomHandler,
  deleteRoomHandler,
} from '../domain/rooms';

/**
 * Room Controller
 * Handles chat room management (Admin+ only for create/update/delete)
 */

/**
 * GET /rooms
 * Get all rooms
 * Returns list of all non-deleted rooms
 */
export const getAllRooms = [
  authenticateToken,
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await getAllRoomsHandler();
    return successResponse(res, result);
  }),
];

/**
 * POST /rooms
 * Create new room (Admin+ only)
 * Auto-generates slug from room name
 */
export const createRoom = [
  authenticateToken,
  requireAdmin(),
  validate(createRoomSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId!;

    const room = await createRoomHandler(userId, req.body);
    return successResponse(res, room, 201);
  }),
];

/**
 * PUT /rooms/:id
 * Update room (Admin+ only)
 * Updates room name and/or visibility, regenerates slug if name changed
 */
export const updateRoom = [
  authenticateToken,
  requireAdmin(),
  validate(updateRoomSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const updatedRoom = await updateRoomHandler(id, req.body);
      return successResponse(res, updatedRoom);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return errorResponse(res, error.message, 404);
      }
      return errorResponse(res, 'Failed to update room', 500);
    }
  }),
];

/**
 * DELETE /rooms/:id
 * Soft delete room (Admin+ only)
 * Marks room as deleted without removing from database
 */
export const deleteRoom = [
  authenticateToken,
  requireAdmin(),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      await deleteRoomHandler(id);
      return successResponse(res, { message: 'Room deleted successfully' });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return errorResponse(res, error.message, 404);
      }
      return errorResponse(res, 'Failed to delete room', 500);
    }
  }),
];
