import { Event, EventVisibility, UserRole } from '../../models';

/**
 * Event Visibility Service
 * Handles event permission checks based on visibility rules
 */

/**
 * Check if user can view an event based on visibility rules
 */
export function canViewEvent(event: Event, userId: string, userRole: UserRole): boolean {
  // Private: owner only
  if (event.visibility === EventVisibility.Private) {
    return event.createdBy === userId;
  }

  // Public: all authenticated users
  if (event.visibility === EventVisibility.Public) {
    return true;
  }

  // Restricted: owner + allowedUserIds + Admin/Superuser
  if (event.visibility === EventVisibility.Restricted) {
    if (event.createdBy === userId) return true;
    if (userRole === UserRole.Admin || userRole === UserRole.Superuser) return true;
    if (event.allowedUserIds && event.allowedUserIds.includes(userId)) return true;
    return false;
  }

  return false;
}

/**
 * Check if user can modify an event
 */
export function canModifyEvent(event: Event, userId: string, userRole: UserRole): boolean {
  // Owner can always modify
  if (event.createdBy === userId) return true;

  // Admin and Superuser can modify any event
  if (userRole === UserRole.Admin || userRole === UserRole.Superuser) return true;

  return false;
}
