import { User } from '../../models';

/**
 * Update My Profile Handler
 * Updates the authenticated user's profile information
 */
export async function updateMyProfileHandler(
  userId: string,
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

  // Update user with allowed fields
  const { username, firstName, lastName, phoneNumber, bio } = updateData;
  const updates: any = {};

  if (username !== undefined) updates.username = username;
  if (firstName !== undefined) updates.firstName = firstName;
  if (lastName !== undefined) updates.lastName = lastName;
  if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber;
  if (bio !== undefined) updates.bio = bio;

  try {
    await user.update(updates);

    // Return updated user without password hash
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['passwordHash'] },
    });

    return updatedUser;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('username') && error.message.includes('must be unique')) {
        throw new Error('Username already taken');
      }
    }
    throw error;
  }
}
