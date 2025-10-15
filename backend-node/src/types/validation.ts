import { z } from 'zod';

/**
 * Auth validation schemas
 */
export const registerSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Profile validation schemas
 */
export const updateProfileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
  bio: z.string().optional(),
});

/**
 * Message validation schemas
 */
export const sendMessageSchema = z.object({
  toUserId: z.string().uuid('Invalid user ID'),
  content: z.string().min(1, 'Message content is required'),
});

/**
 * Event validation schemas
 */
export const createEventSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    startTime: z.string(),
    endTime: z.string(),
    // Accept visibility in any case
    visibility: z.string(),
    allowedUserIds: z.array(z.string().uuid()).optional(),
    color: z.string().optional(),
    location: z.string().optional(),
  })
  .transform((data) => {
    // Validate that dates can be parsed
    const startDate = new Date(data.startTime);
    const endDate = new Date(data.endTime);

    if (isNaN(startDate.getTime())) {
      throw new Error('Invalid startTime format');
    }
    if (isNaN(endDate.getTime())) {
      throw new Error('Invalid endTime format');
    }

    // Validate visibility (PascalCase to match EventVisibility enum)
    const visibility = data.visibility;

    // Validate visibility value
    if (!['Private', 'Public', 'Restricted'].includes(visibility)) {
      throw new Error('Invalid visibility option');
    }

    return {
      ...data,
      visibility: visibility as 'Private' | 'Public' | 'Restricted',
    };
  });

export const updateEventSchema = z
  .object({
    title: z.string().min(1, 'Title is required').optional(),
    description: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    // Accept visibility in any case
    visibility: z.string().optional(),
    allowedUserIds: z.array(z.string().uuid()).optional(),
    color: z.string().optional(),
    location: z.string().optional(),
  })
  .transform((data) => {
    // Validate dates if provided
    if (data.startTime) {
      const startDate = new Date(data.startTime);
      if (isNaN(startDate.getTime())) {
        throw new Error('Invalid startTime format');
      }
    }
    if (data.endTime) {
      const endDate = new Date(data.endTime);
      if (isNaN(endDate.getTime())) {
        throw new Error('Invalid endTime format');
      }
    }

    // Validate visibility if provided (PascalCase to match EventVisibility enum)
    let visibility = data.visibility;
    if (visibility) {
      if (!['Private', 'Public', 'Restricted'].includes(visibility)) {
        throw new Error('Invalid visibility option');
      }
    }

    return {
      ...data,
      visibility: visibility as 'Private' | 'Public' | 'Restricted' | undefined,
    };
  });

/**
 * Room validation schemas
 */
export const createRoomSchema = z.object({
  name: z.string().min(1, 'Room name is required'),
  isPublic: z.boolean(),
});

export const updateRoomSchema = z.object({
  name: z.string().min(1, 'Room name is required').optional(),
  isPublic: z.boolean().optional(),
});

/**
 * Page validation schemas
 */
export const createPageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().optional(), // Auto-generated from title if not provided
  content: z.string().min(1, 'Content is required'),
  isPublished: z.boolean().optional(),
});

export const updatePageSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  slug: z.string().min(1, 'Slug is required').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  isPublished: z.boolean().optional(),
});

/**
 * User management validation schemas
 */
export const updateUserRoleSchema = z.object({
  role: z.enum(['User', 'Admin', 'Superuser']),
});

/**
 * Password management validation schemas
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

/**
 * Type exports for TypeScript inference
 */
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
