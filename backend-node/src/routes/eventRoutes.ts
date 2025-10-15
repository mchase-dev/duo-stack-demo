import { Router } from 'express';
import * as eventController from '../controllers/eventController';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createEventSchema, updateEventSchema } from '../types/validation';

/**
 * Event routes
 * Base path: /api/v1/events
 */
const router = Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/v1/events - Get events with filtering
router.get('/', eventController.getEvents);

// POST /api/v1/events - Create event
router.post('/', validate(createEventSchema), eventController.createEvent);

// GET /api/v1/events/:id - Get event by ID
router.get('/:id', eventController.getEventById);

// PUT /api/v1/events/:id - Update event
router.put('/:id', validate(updateEventSchema), eventController.updateEvent);

// DELETE /api/v1/events/:id - Soft delete event
router.delete('/:id', eventController.deleteEvent);

export default router;
