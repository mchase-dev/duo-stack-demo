import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { sendMessageSchema } from '../types/validation';
import { successResponse, errorResponse } from '../utils/response';
import {
  getConversationsHandler,
  getMessagesWithUserHandler,
  sendMessageHandler,
} from '../domain/messages';

/**
 * Message Controller
 * Handles direct messaging between users
 */

/**
 * GET /messages/conversations
 * Get all conversations with last message and unread count
 * Returns list of users with whom current user has exchanged messages
 */
export const getConversations = [
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId!;

    const result = await getConversationsHandler(userId);
    return successResponse(res, result);
  }),
];

/**
 * GET /messages/conversations/:userId
 * Get messages with specific user
 * Returns all messages between current user and specified user
 * Marks all messages from other user as read
 */
export const getMessagesWithUser = [
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const currentUserId = req.user?.userId!;
    const { userId } = req.params;

    try {
      const result = await getMessagesWithUserHandler(currentUserId, userId);
      return successResponse(res, result);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return errorResponse(res, error.message, 404);
      }
      return errorResponse(res, 'Failed to retrieve messages', 500);
    }
  }),
];

/**
 * POST /messages
 * Send message to another user
 * Creates new message in the system
 */
export const sendMessage = [
  authenticateToken,
  validate(sendMessageSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const fromUserId = req.user?.userId!;
    const { toUserId, content } = req.body;

    try {
      const message = await sendMessageHandler(fromUserId, { toUserId, content });

      // Emit real-time event to both sender and recipient
      const realtimeService = req.app.locals.realtimeService;
      if (realtimeService) {
        const messageEvent = {
          messageId: message.id,
          senderId: message.fromUserId,
          senderUsername: req.user?.email || 'Unknown', // Will need to get proper username
          receiverId: message.toUserId,
          message: content,
          timestamp: message.createdAt,
        };

        // Emit to recipient
        realtimeService.emitUserMessage(toUserId, messageEvent);
        // Also emit to sender so their UI updates
        realtimeService.emitUserMessage(fromUserId, messageEvent);
      }

      return successResponse(res, message, 201);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Cannot send message to yourself')) {
          return errorResponse(res, error.message, 400);
        }
        if (error.message.includes('not found')) {
          return errorResponse(res, error.message, 404);
        }
      }
      return errorResponse(res, 'Failed to send message', 500);
    }
  }),
];
