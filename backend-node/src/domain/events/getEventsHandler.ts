import { Op } from 'sequelize';
import { Event, User, UserRole } from '../../models';
import { canViewEvent } from './eventVisibilityService';
import { transformEvent } from './transformEvent';

/**
 * Get Events Handler
 * Retrieves events filtered by date range and visibility
 * Returns only events the user has permission to view
 */
export async function getEventsHandler(
  userId: string,
  userRole: UserRole,
  filters: {
    from?: string;
    to?: string;
    visibility?: string;
  }
) {
  const { from, to, visibility } = filters;

  // Build where clause
  const whereClause: any = {};

  // Filter by date range
  if (from || to) {
    whereClause.startTime = {};
    if (from) {
      whereClause.startTime[Op.gte] = new Date(from);
    }
    if (to) {
      whereClause.endTime = { [Op.lte]: new Date(to) };
    }
  }

  // Filter by visibility
  if (visibility) {
    whereClause.visibility = visibility;
  }

  // Get all events matching basic filters, including creator
  const allEvents = await Event.findAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'username'],
      },
    ],
    order: [['startTime', 'ASC']],
  });

  // Filter events based on visibility permissions
  const filteredEvents = allEvents.filter((event) => canViewEvent(event, userId, userRole));

  // Transform events to match API contract
  const events = filteredEvents.map(transformEvent);

  return events;
}
