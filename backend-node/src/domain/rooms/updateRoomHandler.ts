import { Room } from '../../models';
import { generateSlug } from './slugService';

/**
 * Update Room Handler
 * Updates a chat room (Admin+ only)
 * Regenerates slug if name is changed
 */
export async function updateRoomHandler(
  roomId: string,
  updateData: {
    name?: string;
    isPublic?: boolean;
  }
) {
  const { name, isPublic } = updateData;

  // Find room by ID
  const room = await Room.findByPk(roomId);

  if (!room) {
    throw new Error('Room not found');
  }

  // Prepare update data
  const updates: any = {};

  if (isPublic !== undefined) updates.isPublic = isPublic;

  // If name is being updated, regenerate slug
  if (name !== undefined) {
    updates.name = name;

    const baseSlug = generateSlug(name);
    let slug = baseSlug;
    let counter = 1;

    // Ensure slug is unique (excluding current room)
    while (true) {
      const existing = await Room.findOne({ where: { slug } });
      if (!existing || existing.id === roomId) {
        break;
      }
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    updates.slug = slug;
  }

  // Update room
  await room.update(updates);

  // Return updated room
  const updatedRoom = await Room.findByPk(roomId);

  return updatedRoom;
}
