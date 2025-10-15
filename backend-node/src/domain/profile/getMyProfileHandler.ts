import { User } from '../../models';

/**
 * Get My Profile Handler
 * Retrieves the authenticated user's profile
 */
export async function getMyProfileHandler(userId: string) {
  // Find user by ID
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['passwordHash'] },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}
