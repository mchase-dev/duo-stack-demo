import { Event, UserRole } from '../../models';
import { canModifyEvent } from './eventVisibilityService';

/**
 * Delete Event Handler
 * Soft deletes an event if user is owner, Admin, or Superuser
 */
export async function deleteEventHandler(eventId: string, userId: string, userRole: UserRole) {
  // Find event by ID
  const event = await Event.findByPk(eventId);

  if (!event) {
    throw new Error('Event not found');
  }

  // Check modify permissions
  if (!canModifyEvent(event, userId, userRole)) {
    throw new Error('Insufficient permissions to delete this event');
  }

  // Soft delete event (paranoid mode sets deletedAt timestamp)
  await event.destroy();

  return { message: 'Event deleted successfully' };
}
