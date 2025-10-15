import { Room } from '../../models';

/**
 * Delete Room Handler
 * Soft deletes a chat room (Admin+ only)
 */
export async function deleteRoomHandler(roomId: string) {
  // Find room by ID
  const room = await Room.findByPk(roomId);

  if (!room) {
    throw new Error('Room not found');
  }

  // Soft delete room (paranoid mode sets deletedAt timestamp)
  await room.destroy();

  return { message: 'Room deleted successfully' };
}
