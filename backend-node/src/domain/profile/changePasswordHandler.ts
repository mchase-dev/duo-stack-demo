import { User } from '../../models';
import { comparePassword, hashPassword, validatePasswordStrength } from '../../utils/password';
import type { ChangePasswordInput } from '../../types/validation';

/**
 * Change password for current user
 */
export async function changePasswordHandler(
  userId: string,
  data: ChangePasswordInput
): Promise<void> {
  // Find user
  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Verify current password
  const isValid = await comparePassword(data.currentPassword, user.passwordHash);
  if (!isValid) {
    const error = new Error('Current password is incorrect');
    (error as any).status = 401;
    throw error;
  }

  // Validate new password strength
  const validation = validatePasswordStrength(data.newPassword);
  if (!validation.valid) {
    const error = new Error(validation.errors.join(', '));
    (error as any).status = 400;
    throw error;
  }

  // Hash and save new password
  user.passwordHash = await hashPassword(data.newPassword);
  await user.save();
}
