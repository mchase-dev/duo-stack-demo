import { Event, User, UserRole } from '../../models';
import { canModifyEvent } from './eventVisibilityService';
import { transformEvent } from './transformEvent';

/**
 * Update Event Handler
 * Updates an event if user is owner, Admin, or Superuser
 */
export async function updateEventHandler(
  eventId: string,
  userId: string,
  userRole: UserRole,
  updateData: {
    title?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    visibility?: string;
    allowedUserIds?: string[];
    color?: string;
    location?: string;
  }
) {
  // Find event by ID
  const event = await Event.findByPk(eventId);

  if (!event) {
    throw new Error('Event not found');
  }

  // Check modify permissions
  if (!canModifyEvent(event, userId, userRole)) {
    throw new Error('Insufficient permissions to update this event');
  }

  // Prepare update data
  const { title, description, startTime, endTime, visibility, allowedUserIds, color, location } = updateData;
  const updates: any = {};

  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (startTime !== undefined) updates.startTime = new Date(startTime);
  if (endTime !== undefined) updates.endTime = new Date(endTime);
  if (visibility !== undefined) updates.visibility = visibility;
  if (allowedUserIds !== undefined) updates.allowedUserIds = allowedUserIds;
  if (color !== undefined) updates.color = color;
  if (location !== undefined) updates.location = location;

  // Validate date range if both are provided
  if (updates.startTime && updates.endTime) {
    if (updates.endTime <= updates.startTime) {
      throw new Error('End time must be after start time');
    }
  }

  // Validate allowedUserIds if provided
  if (allowedUserIds && allowedUserIds.length > 0) {
    for (const allowedUserId of allowedUserIds) {
      const user = await User.findByPk(allowedUserId);
      if (!user) {
        throw new Error(`User with ID ${allowedUserId} not found`);
      }
    }
  }

  // Update event
  await event.update(updates);

  // Return updated event with creator
  const updatedEvent = await Event.findByPk(eventId, {
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'username'],
      },
    ],
  });

  if (!updatedEvent) {
    throw new Error('Event not found after update');
  }

  // Transform event to match API contract
  return transformEvent(updatedEvent);
}
