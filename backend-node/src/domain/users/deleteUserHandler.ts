import { User } from '../../models';

/**
 * Delete User Handler
 * Soft deletes a user (Admin+ only)
 */
export async function deleteUserHandler(userId: string) {
  // Find user by ID
  const user = await User.findByPk(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Soft delete user (paranoid mode sets deletedAt timestamp)
  await user.destroy();

  return { message: 'User deleted successfully' };
}
