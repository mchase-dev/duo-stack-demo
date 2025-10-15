import { User, UserRole } from '../../models';

/**
 * Update User Role Handler
 * Updates user's role (Superuser only)
 */
export async function updateUserRoleHandler(userId: string, role: UserRole) {
  // Find user by ID
  const user = await User.findByPk(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Update user role
  await user.update({ role });

  // Return updated user without password hash
  const updatedUser = await User.findByPk(userId, {
    attributes: { exclude: ['passwordHash'] },
  });

  return updatedUser;
}
