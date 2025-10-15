import { Room } from '../../models';
import { generateSlug } from './slugService';

/**
 * Create Room Handler
 * Creates a new chat room (Admin+ only)
 * Auto-generates unique slug from room name
 */
export async function createRoomHandler(
  userId: string,
  roomData: {
    name: string;
    isPublic: boolean;
  }
) {
  const { name, isPublic } = roomData;

  // Generate slug from name
  const baseSlug = generateSlug(name);
  let slug = baseSlug;
  let counter = 1;

  // Ensure slug is unique
  while (await Room.findOne({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Create room
  const room = await Room.create({
    name,
    slug,
    isPublic,
    createdBy: userId,
  });

  return room;
}
