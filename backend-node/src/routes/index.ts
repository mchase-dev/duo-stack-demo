import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import profileRoutes from './profileRoutes';
import messageRoutes from './messageRoutes';
import eventRoutes from './eventRoutes';
import roomRoutes from './roomRoutes';
import pageRoutes from './pageRoutes';

/**
 * Main router - mounts all route modules
 */
const router = Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/profile', profileRoutes);
router.use('/messages', messageRoutes);
router.use('/events', eventRoutes);
router.use('/rooms', roomRoutes);
router.use('/pages', pageRoutes);

export default router;
