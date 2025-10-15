import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createEventSchema, updateEventSchema } from '../types/validation';
import { UserRole } from '../models';
import { successResponse, errorResponse } from '../utils/response';
import {
  getEventsHandler,
  createEventHandler,
  getEventByIdHandler,
  updateEventHandler,
  deleteEventHandler,
} from '../domain/events';

/**
 * Event Controller
 * Handles calendar event management with visibility controls
 */

/**
 * GET /events?from=...&to=...&visibility=...
 * Get events filtered by date range and visibility
 * Returns events user has permission to view
 */
export const getEvents = [
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId!;
    const userRole = req.user?.role as UserRole;
    const { from, to, visibility } = req.query;

    const result = await getEventsHandler(userId, userRole, {
      from: from as string | undefined,
      to: to as string | undefined,
      visibility: visibility as string | undefined,
    });

    return successResponse(res, result);
  }),
];

/**
 * POST /events
 * Create new event
 * Creates calendar event with visibility settings
 */
export const createEvent = [
  authenticateToken,
  validate(createEventSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId!;

    try {
      const event = await createEventHandler(userId, req.body);
      return successResponse(res, event, 201);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('End time must be after start time')) {
          return errorResponse(res, error.message, 400);
        }
        if (error.message.includes('not found')) {
          return errorResponse(res, error.message, 404);
        }
      }
      return errorResponse(res, 'Failed to create event', 500);
    }
  }),
];

/**
 * GET /events/:id
 * Get event by ID
 * Returns event if user has permission to view it
 */
export const getEventById = [
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId!;
    const userRole = req.user?.role as UserRole;
    const { id } = req.params;

    try {
      const event = await getEventByIdHandler(id, userId, userRole);
      return successResponse(res, event);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return errorResponse(res, error.message, 404);
        }
        if (error.message.includes('Insufficient permissions')) {
          return errorResponse(res, error.message, 403);
        }
      }
      return errorResponse(res, 'Failed to retrieve event', 500);
    }
  }),
];

/**
 * PUT /events/:id
 * Update event
 * Updates event if user is owner, Admin, or Superuser
 */
export const updateEvent = [
  authenticateToken,
  validate(updateEventSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId!;
    const userRole = req.user?.role as UserRole;
    const { id } = req.params;

    try {
      const updatedEvent = await updateEventHandler(id, userId, userRole, req.body);
      return successResponse(res, updatedEvent);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return errorResponse(res, error.message, 404);
        }
        if (error.message.includes('Insufficient permissions')) {
          return errorResponse(res, error.message, 403);
        }
        if (error.message.includes('End time must be after start time')) {
          return errorResponse(res, error.message, 400);
        }
      }
      return errorResponse(res, 'Failed to update event', 500);
    }
  }),
];

/**
 * DELETE /events/:id
 * Soft delete event
 * Deletes event if user is owner, Admin, or Superuser
 */
export const deleteEvent = [
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId!;
    const userRole = req.user?.role as UserRole;
    const { id } = req.params;

    try {
      await deleteEventHandler(id, userId, userRole);
      return successResponse(res, { message: 'Event deleted successfully' });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return errorResponse(res, error.message, 404);
        }
        if (error.message.includes('Insufficient permissions')) {
          return errorResponse(res, error.message, 403);
        }
      }
      return errorResponse(res, 'Failed to delete event', 500);
    }
  }),
];
