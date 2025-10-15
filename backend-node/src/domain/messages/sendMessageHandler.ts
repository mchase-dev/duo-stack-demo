import { Message, User } from '../../models';

/**
 * Send Message Handler
 * Creates a new message from one user to another
 */
export async function sendMessageHandler(
  fromUserId: string,
  messageData: {
    toUserId: string;
    content: string;
  }
) {
  const { toUserId, content } = messageData;

  // Validate that sender and recipient are different
  if (fromUserId === toUserId) {
    throw new Error('Cannot send message to yourself');
  }

  // Validate that recipient exists
  const recipient = await User.findByPk(toUserId);

  if (!recipient) {
    throw new Error('Recipient user not found');
  }

  // Create message
  const message = await Message.create({
    fromUserId,
    toUserId,
    content,
    isRead: false,
  });

  return message;
}
