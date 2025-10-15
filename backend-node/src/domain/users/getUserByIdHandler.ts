import { User, UserRole } from '../../models';

/**
 * Get User By ID Handler
 * Retrieves a user profile (self or Admin+)
 */
export async function getUserByIdHandler(
  userId: string,
  requestingUserId: string,
  requestingUserRole: UserRole
) {
  // Find user by ID
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['passwordHash'] },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Check permissions: user can view self, or user is Admin/Superuser
  const isSelf = requestingUserId === userId;
  const isAdmin = requestingUserRole === UserRole.Admin || requestingUserRole === UserRole.Superuser;

  if (!isSelf && !isAdmin) {
    throw new Error('Insufficient permissions to view this user');
  }

  return user;
}
