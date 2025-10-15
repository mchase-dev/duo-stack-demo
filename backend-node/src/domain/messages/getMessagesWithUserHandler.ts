import { Op } from 'sequelize';
import { Message, User } from '../../models';

/**
 * Get Messages With User Handler
 * Retrieves all messages between current user and specified user
 * Marks all messages from other user as read
 */
export async function getMessagesWithUserHandler(currentUserId: string, otherUserId: string) {
  // Validate that the other user exists
  const otherUser = await User.findByPk(otherUserId, {
    attributes: { exclude: ['passwordHash'] },
  });

  if (!otherUser) {
    throw new Error('User not found');
  }

  // Get all messages between the two users
  const messages = await Message.findAll({
    where: {
      [Op.or]: [
        { fromUserId: currentUserId, toUserId: otherUserId },
        { fromUserId: otherUserId, toUserId: currentUserId },
      ],
    },
    order: [['createdAt', 'ASC']],
  });

  // Mark all messages from other user as read
  await Message.update(
    { isRead: true },
    {
      where: {
        fromUserId: otherUserId,
        toUserId: currentUserId,
        isRead: false,
      },
    }
  );

  return { messages, user: otherUser };
}
