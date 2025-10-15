import { Op } from 'sequelize';
import { Message, User } from '../../models';

/**
 * Get Conversations Handler
 * Retrieves all conversations with last message and unread count
 * Returns list of users with whom current user has exchanged messages
 */
export async function getConversationsHandler(userId: string) {
  // Get all messages where user is sender or recipient
  const messages = await Message.findAll({
    where: {
      [Op.or]: [{ fromUserId: userId }, { toUserId: userId }],
    },
    order: [['createdAt', 'DESC']],
  });

  // Build conversations map with last message and unread count
  const conversationsMap = new Map<string, any>();

  for (const message of messages) {
    const otherUserId = message.fromUserId === userId ? message.toUserId : message.fromUserId;

    if (!conversationsMap.has(otherUserId)) {
      // Count unread messages from this user
      const unreadCount = await Message.count({
        where: {
          fromUserId: otherUserId,
          toUserId: userId,
          isRead: false,
        },
      });

      conversationsMap.set(otherUserId, {
        userId: otherUserId,
        lastMessage: message,
        unreadCount,
      });
    }
  }

  // Get user details for all conversations
  const conversations = [];
  for (const [otherUserId, convData] of conversationsMap) {
    const user = await User.findByPk(otherUserId, {
      attributes: { exclude: ['passwordHash'] },
    });

    if (user) {
      conversations.push({
        user,
        lastMessage: convData.lastMessage,
        unreadCount: convData.unreadCount,
      });
    }
  }

  // Sort by last message time
  conversations.sort((a, b) => {
    return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
  });

  return conversations;
}
