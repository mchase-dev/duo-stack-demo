import { Room } from '../../models';

/**
 * Get All Rooms Handler
 * Retrieves all non-deleted rooms
 */
export async function getAllRoomsHandler() {
  // Get all rooms (paranoid mode excludes soft-deleted)
  const rooms = await Room.findAll({
    order: [['createdAt', 'DESC']],
  });

  // Return direct array (matching .NET)
  return rooms;
}
