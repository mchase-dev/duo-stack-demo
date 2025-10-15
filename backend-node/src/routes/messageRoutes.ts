import { Router } from 'express';
import * as messageController from '../controllers/messageController';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { sendMessageSchema } from '../types/validation';

/**
 * Message routes
 * Base path: /api/v1/messages
 */
const router = Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/v1/messages/conversations - Get all conversations
router.get('/conversations', messageController.getConversations);

// GET /api/v1/messages/conversations/:userId - Get messages with specific user
router.get('/conversations/:userId', messageController.getMessagesWithUser);

// POST /api/v1/messages - Send message
router.post('/', validate(sendMessageSchema), messageController.sendMessage);

export default router;
