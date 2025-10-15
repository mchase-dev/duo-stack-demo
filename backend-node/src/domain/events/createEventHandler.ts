import { Event, User, EventVisibility } from '../../models';
import { transformEvent } from './transformEvent';

/**
 * Create Event Handler
 * Creates a new calendar event with visibility settings
 */
export async function createEventHandler(
  userId: string,
  eventData: {
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    visibility: string;
    allowedUserIds?: string[];
    color?: string;
    location?: string;
  }
) {
  const { title, description, startTime, endTime, visibility, allowedUserIds, color, location } = eventData;

  // Validate date range
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (end <= start) {
    throw new Error('End time must be after start time');
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

  // Create event
  const event = await Event.create({
    title,
    description,
    startTime: start,
    endTime: end,
    visibility: visibility as EventVisibility,
    allowedUserIds: allowedUserIds,
    createdBy: userId,
    color,
    location,
  });

  // Reload with creator to transform
  const eventWithCreator = await Event.findByPk(event.id, {
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'username'],
      },
    ],
  });

  if (!eventWithCreator) {
    throw new Error('Event not found after creation');
  }

  // Transform event to match API contract
  return transformEvent(eventWithCreator);
}
