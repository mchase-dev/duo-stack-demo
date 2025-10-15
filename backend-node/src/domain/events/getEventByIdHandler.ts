import { Event, User, UserRole } from '../../models';
import { canViewEvent } from './eventVisibilityService';
import { transformEvent } from './transformEvent';

/**
 * Get Event By ID Handler
 * Retrieves a specific event if user has permission to view it
 */
export async function getEventByIdHandler(eventId: string, userId: string, userRole: UserRole) {
  // Find event by ID, including creator
  const event = await Event.findByPk(eventId, {
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'username'],
      },
    ],
  });

  if (!event) {
    throw new Error('Event not found');
  }

  // Check visibility permissions
  if (!canViewEvent(event, userId, userRole)) {
    throw new Error('Insufficient permissions to view this event');
  }

  // Transform event to match API contract
  return transformEvent(event);
}
