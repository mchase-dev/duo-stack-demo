import { User, UserRole } from '../../models';

/**
 * Update User Handler
 * Updates user profile (self or Admin+)
 */
export async function updateUserHandler(
  userId: string,
  requestingUserId: string,
  requestingUserRole: UserRole,
  updateData: {
    username?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    bio?: string;
  }
) {
  // Find user by ID
  const user = await User.findByPk(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Check permissions: user can update self, or user is Admin/Superuser
  const isSelf = requestingUserId === userId;
  const isAdmin = requestingUserRole === UserRole.Admin || requestingUserRole === UserRole.Superuser;

  if (!isSelf && !isAdmin) {
    throw new Error('Insufficient permissions to update this user');
  }

  // Update user with allowed fields
  const { username, firstName, lastName, phoneNumber, bio } = updateData;
  const updates: any = {};

  if (username !== undefined) updates.username = username;
  if (firstName !== undefined) updates.firstName = firstName;
  if (lastName !== undefined) updates.lastName = lastName;
  if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber;
  if (bio !== undefined) updates.bio = bio;

  await user.update(updates);

  // Return updated user without password hash
  const updatedUser = await User.findByPk(userId, {
    attributes: { exclude: ['passwordHash'] },
  });

  return updatedUser;
}
